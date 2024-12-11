import { useEffect, useState } from 'react';
import { getProjects } from "@/lib/actions/projects.actions";
import { useLocalStorage } from "usehooks-ts";

type Project = {
    id: string;
    name: string;
    [key: string]: any;
};

type UseProjectsReturn = {
    projects: Project[];
    project: Project | undefined;
    selectedProject: string;
    setSelectedProject: (value: string) => void;
    loading: boolean;
    error: Error | null;
};

export const useProjects = (): UseProjectsReturn => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedProject, setSelectedProject] = useLocalStorage<string>('projectId', '');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjects();
                setProjects(response.data || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const project = projects.find((project) => project.id === selectedProject);

    return {
        projects,
        project,
        selectedProject,
        setSelectedProject,
        loading,
        error
    };
};
