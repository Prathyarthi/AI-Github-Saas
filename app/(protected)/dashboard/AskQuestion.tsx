'use-client'

import { useProjects } from "@/hooks/use-project"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { askQuestion } from "@/lib/actions/ask.actions"
import { readStreamableValue } from "ai/rsc"

const AskQuestion = () => {
    const [question, setQuestion] = useState("")
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);
    const [fileReferences, setFileReferences] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
    const [answers, setAnswers] = useState('');

    const { project } = useProjects()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!project?.id) return
        setLoading(true)
        setOpen(true)

        const { output, fileReferences } = await askQuestion(question, project.id)
        setFileReferences(fileReferences)

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswers(ans => ans + delta)
            }
        }

        setLoading(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <Image src="/logo.png" alt="image" width={40} height={40} />
                        </DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder="Ask a question" />
                        <div className="h-4"></div>
                        <Button type="submit">
                            Ask RepoX! 🚀
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestion