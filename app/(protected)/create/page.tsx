import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"

interface CreateProps {
    repoUrl: string,
    projectName: string,
    githubToken: string
}

const page = () => {

    const { register, handleSubmit, reset } = useForm<CreateProps>()

    const onSubmit = (data: CreateProps) => {
        return true
    }

    return (
        <div className="flex justify-center items-center gap-12 h-full">
            <div>
                <div>
                    <h1 className="font-semibold text-2xl">
                        Link your Github repository
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Link your Github repository to get started
                    </p>
                </div>

                <div className="h-4"></div>

                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input required {...register("repoUrl")} placeholder="Repository URL" />
                        <div className="h-4"></div>
                        <Input required {...register("projectName")} placeholder="Project name" />
                        <div className="h-4"></div>
                        <Input {...register("githubToken")} placeholder="Github Access Token (Optional)" />
                        <div className="h-4"></div>
                        <Button type="submit">
                            Create Project
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default page