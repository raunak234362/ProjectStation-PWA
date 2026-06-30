import AllProjectNotes from "../components/project/notes/AllProjectNotes";

interface ProjectNotesLayoutProps {
  projectId: string;
  project?: any;
}

const ProjectNotesLayout = ({ projectId, project }: ProjectNotesLayoutProps) => {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white project-component-container">
      <div className="flex-1 min-h-0 px-8 py-6 pb-8 overflow-y-auto">
        <AllProjectNotes projectId={projectId} project={project} />
      </div>
    </div>
  );
};

export default ProjectNotesLayout;
