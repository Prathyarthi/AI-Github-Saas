import db from "@/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const currentProfile = async () => {
    const user = await currentUser()

    if (!user) {
        return null
    }

    const profile = await db.user.findFirst({
        where: {
            email: user.emailAddresses[0].emailAddress
        }
    });

    return profile;
};
