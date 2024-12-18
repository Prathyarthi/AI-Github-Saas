import db from '@/prisma'
import { Octokit } from 'octokit'
import axios from 'axios'
import { aiSummarizeContent } from './gemini'

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

interface CommitProps {
    commitHash: string
    commitMessage: string
    commitAuthorName: string
    commitAvatar: string
    commitDate: string
}

export const getCommitHashes = async (githubUrl: string): Promise<CommitProps[]> => {
    const { data } = await octokit.rest.repos.listCommits({
        owner: githubUrl.split('/')[3],
        repo: githubUrl.split('/')[4]
    })

    const sortedCommit = data.sort((a: any, b: any) => new Date(b.commit.author?.date).getTime() - new Date(a.commit.author?.date).getTime()) as any[]

    return sortedCommit.slice(0, 10).map((commit) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message,
        commitAuthorName: commit.commit.author.name,
        commitAvatar: commit.commit.author.avatar_url,
        commitDate: commit.commit.author.date
    }))
}

export const pollCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId)
    const commitHashes = await getCommitHashes(githubUrl)
    console.log(commitHashes);
    
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes)

    console.log("Unprocessed commits: ", unprocessedCommits);
    
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map((commit) => {
        return summarizeCommit(githubUrl, commit.commitHash)
    }))
    console.log(summaryResponses);
    

    const summaries = summaryResponses.map((response) => {
        if (response.status === 'fulfilled') {
            return response.value as string
        }

        return ''
    })

    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthor: unprocessedCommits[index]!.commitAuthorName,
                commitAvatar: unprocessedCommits[index]!.commitAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary
            }
        })
    })
    console.log(commits);


    return commits
}

async function summarizeCommit(githubUrl: string, commitHash: string) {
    const { data } = await axios.get(`${githubUrl}/commits/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    })

    console.log(data);
    

    return await aiSummarizeContent(data) || ""
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            githubUrl: true
        }
    })

    if (!project?.githubUrl) {
        throw new Error('Project has no github url')
    }

    return { project, githubUrl: project?.githubUrl }
}

async function filterUnprocessedCommits(projectId: string, commitHashes: CommitProps[]) {
    const processedCommits = await db.commit.findMany({
        where: {
            id: projectId
        },
        select: {
            commitHash: true
        }
    })

    const unprocessedCommits = commitHashes.filter((commit) => {
        !processedCommits?.some((processedCommit: any) => processedCommit.commitHash === commit.commitHash)
    })

    return unprocessedCommits
}