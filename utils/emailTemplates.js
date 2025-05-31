module.exports = {
  assignment: (user, project, userType) => {
    let subject;
    let roleDescription;

    switch (userType) {
      case "ProjectManager":
        subject = "You're now the Project Manager 🎯";
        roleDescription = 'been assigned as the <strong><span style="color: #007bff;">Project Manager</span></strong>';
        break;
      case "User":
        subject = "You've joined a new project 🚀";
        roleDescription = 'joined the project as a <strong><span style="color: #007bff;">user</span></strong>';
        break;
      default:
        subject = "Welcome to your new project 🌟";
        roleDescription = 'added to the project team';
        break;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hi ${user.firstName || user.email},</p>

        <p>You have ${roleDescription} for <strong>"${project.title || "Unnamed Project"}</strong>".</p>

        <p>Access your <a href="https://yourdomain.com/dashboard" style="color: #007bff;">project dashboard</a> to get started.</p>

        <p>We’re excited to have you with us! 🚀</p>

        <p style="margin-top: 30px;">Cheers,<br/>The Orkestra Team</p>
      </div>
    `;

    return { subject, html };
  }
};
