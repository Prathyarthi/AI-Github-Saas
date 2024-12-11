"use server";

import db from "@/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { currentProfile } from "../current-profile";

interface CreateProps {
    githubUrl: string,
    projectName: string,
    githubAccessToken: string
}
export const createProject = async ({ githubUrl, projectName, githubAccessToken }: CreateProps) => {
    const user = await currentProfile()

    const project = db.project.create({
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

    return {
        status: 200,
        data: project
    }
};