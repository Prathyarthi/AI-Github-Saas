"use server";

import db from "@/prisma";
import { currentProfile } from "../current-profile";
import { pollCommits } from "../github";

interface CreateProps {
    githubUrl: string,
    projectName: string,
    githubAccessToken: string
}
export const createProject = async ({ githubUrl, projectName, githubAccessToken }: CreateProps) => {
    const user = await currentProfile()

    const project = await db.project.create({
        data: {
            name: projectName,
            githubUrl: githubUrl,
            accessToken: githubAccessToken,
            UserToProject: {
                create: {
                    userId: user!.id
                }
            }
        }
    })

    await pollCommits(project.id)

    return {
        status: 200,
        data: project
    }
};

export const getProjects = async () => {
    const user = await currentProfile()

    const projects = await db.project.findMany({
        where: {
            UserToProject: {
                some: {
                    userId: user!.id
                }
            },
            deletedAt: null
        }
    })

    return {
        status: 200,
        data: projects
    }
}

export const getCommitLogs = async (projectId: string) => {
    await pollCommits(projectId)
    const commits = await db.commit.findMany({
        where: {
            projectId
        }
    })

    return commits
}