// User Profile for Upwork Proposals
export interface UserProfile {
  name: string
  title: string
  experience: string
  skills: string[]
  projects: ProjectHighlight[]
  achievements: string[]
  education: string
  contact?: string
}

export interface ProjectHighlight {
  name: string
  description: string
  technologies: string[]
  achievements: string[]
  category: 'Backend' | 'Frontend' | 'AI' | 'Full-Stack'
}

// Sridharan's Profile Data
export const sridharanProfile: UserProfile = {
  name: "Sridharan",
  title: "Full-Stack Developer & AI Enthusiast",
  experience: "3+ years of full-stack development experience with expertise in building scalable web applications and AI-powered solutions",
  skills: [
    // Languages
    "Python", "JavaScript", "TypeScript", "PHP", "SQL",
    // Frontend
    "React", "Next.js", "Angular", "Redux", "Tailwind CSS",
    // Backend
    "Node.js", "Django", "FastAPI", "Express.js", "GraphQL",
    // Database
    "MongoDB", "PostgreSQL", "Redis", "MySQL", "Firebase",
    // Tools & Platforms
    "AWS", "Docker", "Git", "Jenkins", "Kubernetes",
    // AI/ML
    "TensorFlow", "PyTorch", "Scikit-learn", "OpenAI", "LangChain"
  ],
  projects: [
    {
      name: "Email Marketing Platform",
      description: "A comprehensive platform enabling users to manage campaigns and track performance, serving 50K+ users",
      technologies: ["JavaScript", "Node.js", "MongoDB", "AWS S3"],
      achievements: [
        "Developed rich text editor for email design",
        "Integrated Amazon S3 for media storage",
        "Optimized for high performance with large datasets",
        "Served 50K+ users with 100% delivery rate"
      ],
      category: "Backend"
    },
    {
      name: "AI Code Completion and Review Tool",
      description: "An AI-powered developer assistant for code completion and SDLC acceleration",
      technologies: ["Node.js", "OpenAI", "LangChain", "JavaScript"],
      achievements: [
        "Built Codespell AI to provide intelligent code suggestions",
        "Tracked function dependencies across large codebases",
        "Used LangChain for prompt orchestration and OpenAI for reasoning"
      ],
      category: "AI"
    },
    {
      name: "Real-Time Matching Service Chat",
      description: "A modern chat feature with AI moderation and multimedia capabilities",
      technologies: ["Next.js", "Tailwind CSS", "Framer Motion", "OpenAI", "Socket.IO"],
      achievements: [
        "Built real-time chat with moderation, citation, and search",
        "Used AI to detect and block inappropriate content",
        "Enabled multimedia sharing and reporting features"
      ],
      category: "Frontend"
    },
    {
      name: "Credit Manager Microservice",
      description: "A microservice for managing user credits and payment processing in a scalable way",
      technologies: ["Node.js", "Express", "MongoDB"],
      achievements: [
        "Published a reusable npm package for managing credits",
        "Created complete migration scripts for credit-related tables",
        "Handled transactions across multiple services"
      ],
      category: "Backend"
    }
  ],
  achievements: [
    "Led development of AI-enhanced email marketing platform used by 50K+ users",
    "Built RESTful APIs for campaign management and real-time analytics",
    "40% performance boost across major applications",
    "100% delivery rate on 8+ major projects",
    "Bachelor of Technology in Information Technology from Bannari Amman Institute of Technology"
  ],
  education: "Bachelor of Technology in Information Technology, Bannari Amman Institute of Technology (2019-2023)",
  contact: "https://portfolio-sridharan01234s-projects.vercel.app/contact"
}

// Helper function to get relevant experience for a specialization
export function getRelevantExperience(specialization: string): {
  projects: ProjectHighlight[]
  skills: string[]
  achievements: string[]
} {
  const profile = sridharanProfile
  
  const specializationMap: { [key: string]: { keywords: string[], category?: string } } = {
    'Web Development': { keywords: ['React', 'Next.js', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL'], category: 'Frontend' },
    'Mobile Development': { keywords: ['React', 'JavaScript', 'TypeScript', 'Node.js'] },
    'Design & Creative': { keywords: ['Tailwind CSS', 'Framer Motion', 'React', 'Next.js'] },
    'Writing & Content': { keywords: ['JavaScript', 'Python'] },
    'Digital Marketing': { keywords: ['JavaScript', 'Node.js', 'MongoDB', 'AWS'] },
    'Data Science & AI': { keywords: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'LangChain', 'MongoDB'], category: 'AI' },
    'Virtual Assistant': { keywords: ['JavaScript', 'Node.js', 'Python'] },
    'Video & Animation': { keywords: ['Framer Motion', 'JavaScript'] },
    'Translation': { keywords: ['Python', 'JavaScript'] },
    'Accounting & Finance': { keywords: ['Node.js', 'MongoDB', 'Express'] },
    'Legal Services': { keywords: ['JavaScript', 'Node.js'] },
    'Engineering': { keywords: ['Python', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL'], category: 'Backend' }
  }

  const spec = specializationMap[specialization] || { keywords: [], category: undefined }
  
  // Filter relevant projects
  const relevantProjects = profile.projects.filter(project => {
    if (spec.category && project.category === spec.category) return true
    return project.technologies.some(tech => 
      spec.keywords.some(keyword => tech.toLowerCase().includes(keyword.toLowerCase()))
    )
  })

  // Filter relevant skills
  const relevantSkills = profile.skills.filter(skill =>
    spec.keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
  )

  return {
    projects: relevantProjects.slice(0, 2), // Top 2 most relevant
    skills: relevantSkills,
    achievements: profile.achievements
  }
}

// Helper function to format experience for proposals
export function formatExperienceForProposal(specialization: string): string {
  const { projects, skills, achievements } = getRelevantExperience(specialization)
  const profile = sridharanProfile

  let formattedText = `I'm ${profile.name}, a ${profile.title} with ${profile.experience}.\n\n`
  
  if (projects.length > 0) {
    formattedText += "**Relevant Experience:**\n"
    projects.forEach(project => {
      formattedText += `• ${project.name}: ${project.description}\n`
      if (project.achievements.length > 0) {
        formattedText += `  - ${project.achievements[0]}\n`
      }
    })
    formattedText += "\n"
  }

  if (skills.length > 0) {
    formattedText += `**Key Skills:** ${skills.slice(0, 8).join(', ')}\n\n`
  }

  if (achievements.length > 0) {
    formattedText += `**Notable Achievements:**\n• ${achievements[0]}\n• ${achievements[1]}\n`
  }

  return formattedText
}
