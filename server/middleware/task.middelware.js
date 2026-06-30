export const checkTaskAccess = async (req, res, next) => {

    const task = await Task.findById(req.params.taskId);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);

    const org = await Organisation.findById(project.organisation);

    const member = org.members.find(m =>
        m.user.equals(req.user._id)
    );

    if (!member) {
        return res.status(403).json({ message: "Not a member" });
    }

    req.task = task;
    req.project = project;
    req.org = org;
    req.member = member;

    next();
};