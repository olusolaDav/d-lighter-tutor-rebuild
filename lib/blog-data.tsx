// ============================================
// BLOG MOCK DATA - Types and Mock Data
// ============================================

export type BlogStatus = "published" | "draft" | "scheduled"
export type CommentStatus = "published" | "unpublished" | "pending"

export interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  status: BlogStatus
  tags: string[]
  views: number
  commentsCount: number
  likes: number
  shares: number
  readTime: number
  createdAt: string
  publishedAt?: string
  scheduledAt?: string
  updatedAt: string
}

export interface BlogComment {
  _id: string
  postId: string
  postTitle: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  content: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
}

export interface Notification {
  _id: string
  type: "comment" | "form" | "share" | "review" | "response" | "published"
  actor: {
    _id: string
    name: string
    avatar?: string
    isCompany?: boolean
  }
  action: string
  target?: string
  targetType?: "post" | "form" | "comment"
  targetId?: string
  date: string
  time: string
  read: boolean
}

// Mock Blog Posts
export const mockBlogPosts: BlogPost[] = [
  {
    _id: "blog_001",
    title: "Independent Data Protection Compliance Audit & Gap Analysis",
    slug: "independent-data-protection-compliance-audit-gap-analysis",
    content: `<h2>Data Analytics and Machine Learning Artificial Intelligence and Data Protection Risk Assessment</h2>
<p>Un tableau de bord est un outil de gestion et d'évaluation de l'organisation d'une entreprise. Il est généralement constitué de plusieurs indicateurs de performance à des moments ou des périodes données. Lepilotage de la performance permet ainsi de comparer différents indicateurs et de les mettre en perspective. Le tableau de bord est donc un outil précieux lorsqu'il s'agit de surveiller ses performances et de planifier ses ressources pour ainsi optimiser sa performance.</p>
<p>Le pilotage de la performance par Skello est une interface développée spécialement pour nos clients. L'objectif ? Obtenir une visibilité globale de la santé de son organisation et de ses établissements. Nous avons conçu cette solution de pilotage grâce à vos indicateurs de performance et les données du planning de nos clients.</p>
<p>Voici le détail des indicateurs que les clients pourront analyser pour optimiser leur gestion et leur planification :</p>
<ul>
<li>Chiffre d'affaires, il correspond à la somme des ventes de biens ou de services hors taxes réalisés par un établissement dans le cadre d'une activité professionnelle courante.</li>
<li>Chiffre d'affaires, il correspond à la somme des ventes de biens ou de services hors taxes réalisés par un établissement dans le cadre d'une activité professionnelle courante.</li>
<li>Chiffre d'affaires, il correspond à la somme des ventes de biens ou de services hors taxes réalisés par un établissement dans le cadre d'une activité professionnelle courante.</li>
<li>Chiffre d'affaires, il correspond à la somme des ventes de biens ou de services hors taxes réalisés par un établissement dans le cadre d'une activité professionnelle courante.</li>
</ul>
<p>Un tableau de bord est un outil de gestion et d'évaluation de l'organisation d'une entreprise. Il est généralement constitué de plusieurs indicateurs de performance à des moments ou des périodes données. Lepilotage de la performance permet ainsi de comparer différents indicateurs et de les mettre en perspective. Le tableau de bord est donc un outil précieux lorsqu'il s'agit de surveiller ses performances et de planifier ses ressources pour ainsi optimiser sa performance.</p>`,
    excerpt:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...We bridge the gap between AI innovation and privacy",
    thumbnail: "/data-protection-cybersecurity-cloud.jpg",
    author: {
      _id: "usr_001",
      name: "John Doe",
      avatar: "/professional-man-avatar.png",
    },
    status: "published",
    tags: ["Digital Skills", "Career Advice"],
    views: 3,
    commentsCount: 3,
    likes: 18,
    shares: 18,
    readTime: 5,
    createdAt: "2024-09-13T10:00:00Z",
    publishedAt: "2024-09-13T10:00:00Z",
    updatedAt: "2024-09-13T10:00:00Z",
  },
  {
    _id: "blog_002",
    title: "Independent Data Protection Compliance Audit & Gap Analysis",
    slug: "independent-data-protection-compliance-audit-gap-analysis-2",
    content: "<p>Draft content here...</p>",
    excerpt:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...",
    thumbnail: "/data-privacy-security.png",
    author: {
      _id: "usr_001",
      name: "John Doe",
      avatar: "/professional-man-avatar.png",
    },
    status: "draft",
    tags: [],
    views: 0,
    commentsCount: 0,
    likes: 0,
    shares: 0,
    readTime: 3,
    createdAt: "2024-09-13T10:00:00Z",
    updatedAt: "2024-09-13T10:00:00Z",
  },
  {
    _id: "blog_003",
    title: "Independent Data Protection Compliance Audit & Gap Analysis",
    slug: "independent-data-protection-compliance-audit-gap-analysis-3",
    content:
      "<p>We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...</p>",
    excerpt:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...",
    thumbnail: "/compliance-audit-business.jpg",
    author: {
      _id: "usr_001",
      name: "John Doe",
      avatar: "/professional-man-avatar.png",
    },
    status: "published",
    tags: ["Digital Skills", "Career Advice"],
    views: 3,
    commentsCount: 3,
    likes: 12,
    shares: 8,
    readTime: 4,
    createdAt: "2024-09-13T10:00:00Z",
    publishedAt: "2024-09-13T10:00:00Z",
    updatedAt: "2024-09-13T10:00:00Z",
  },
  {
    _id: "blog_004",
    title: "Independent Data Protection Compliance Audit & Gap Analysis",
    slug: "independent-data-protection-compliance-audit-gap-analysis-4",
    content:
      "<p>We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...</p>",
    excerpt:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...",
    thumbnail: "/gap-analysis-chart.jpg",
    author: {
      _id: "usr_001",
      name: "John Doe",
      avatar: "/professional-man-avatar.png",
    },
    status: "published",
    tags: ["Digital Skills", "Career Advice"],
    views: 3,
    commentsCount: 3,
    likes: 25,
    shares: 15,
    readTime: 6,
    createdAt: "2024-09-13T10:00:00Z",
    publishedAt: "2024-09-13T10:00:00Z",
    updatedAt: "2024-09-13T10:00:00Z",
  },
  {
    _id: "blog_005",
    title: "Independent Data Protection Compliance Audit & Gap Analysis",
    slug: "independent-data-protection-compliance-audit-gap-analysis-5",
    content:
      "<p>We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...</p>",
    excerpt:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...",
    thumbnail: "/data-protection-shield.jpg",
    author: {
      _id: "usr_001",
      name: "John Doe",
      avatar: "/professional-man-avatar.png",
    },
    status: "published",
    tags: ["Digital Skills", "Career Advice"],
    views: 3,
    commentsCount: 3,
    likes: 30,
    shares: 20,
    readTime: 5,
    createdAt: "2024-09-13T10:00:00Z",
    publishedAt: "2024-09-13T10:00:00Z",
    updatedAt: "2024-09-13T10:00:00Z",
  },
  {
    _id: "blog_006",
    title: "Independent Data Protection Compliance Audit & Gap Analysis",
    slug: "independent-data-protection-compliance-audit-gap-analysis-6",
    content:
      "<p>We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...</p>",
    excerpt:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...",
    thumbnail: "/audit-compliance-checklist.jpg",
    author: {
      _id: "usr_001",
      name: "John Doe",
      avatar: "/professional-man-avatar.png",
    },
    status: "published",
    tags: ["Digital Skills", "Career Advice"],
    views: 3,
    commentsCount: 3,
    likes: 22,
    shares: 12,
    readTime: 4,
    createdAt: "2024-09-13T10:00:00Z",
    publishedAt: "2024-09-13T10:00:00Z",
    updatedAt: "2024-09-13T10:00:00Z",
  },
  // Add more for pagination...
]

// Generate more posts for pagination
for (let i = 7; i <= 30; i++) {
  mockBlogPosts.push({
    _id: `blog_${String(i).padStart(3, "0")}`,
    title: "Independent Data Protection Compliance Audit & Gap Analysis",
    slug: `independent-data-protection-compliance-audit-gap-analysis-${i}`,
    content:
      "<p>We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...</p>",
    excerpt:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...",
    thumbnail: `/placeholder.svg?height=200&width=300&query=data protection ${i}`,
    author: {
      _id: "usr_001",
      name: "John Doe",
      avatar: "/professional-man-avatar.png",
    },
    status: i % 5 === 0 ? "draft" : "published",
    tags: i % 5 === 0 ? [] : ["Digital Skills", "Career Advice"],
    views: Math.floor(Math.random() * 100),
    commentsCount: Math.floor(Math.random() * 10),
    likes: Math.floor(Math.random() * 50),
    shares: Math.floor(Math.random() * 30),
    readTime: Math.floor(Math.random() * 10) + 2,
    createdAt: "2024-09-13T10:00:00Z",
    publishedAt: i % 5 === 0 ? undefined : "2024-09-13T10:00:00Z",
    updatedAt: "2024-09-13T10:00:00Z",
  })
}

// Mock Blog Comments
export const mockBlogComments: BlogComment[] = [
  {
    _id: "comment_001",
    postId: "blog_001",
    postTitle: "Why Starting Your Career in Tech ....",
    author: {
      _id: "usr_101",
      name: "Emerson Septimus",
      avatar: "/professional-woman-teal-avatar.jpg",
    },
    content:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...We bridge the gap between AI innovation and privacy We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...We bridge the gap between AI innovation and privacy",
    status: "published",
    createdAt: "2023-04-25T12:34:00Z",
    updatedAt: "2023-04-25T12:34:00Z",
  },
  {
    _id: "comment_002",
    postId: "blog_001",
    postTitle: "Why Starting Your Career in Tech ....",
    author: {
      _id: "usr_102",
      name: "Emerson Septimus",
      avatar: "/professional-man-beige-avatar.jpg",
    },
    content:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...We bridge the gap between AI innovation and privacy...",
    status: "published",
    createdAt: "2023-04-25T12:34:00Z",
    updatedAt: "2023-04-25T12:34:00Z",
  },
  {
    _id: "comment_003",
    postId: "blog_002",
    postTitle: "Why Starting Your Career in Tech ....",
    author: {
      _id: "usr_103",
      name: "Emerson Septimus",
      avatar: "/professional-avatar.png",
    },
    content:
      "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business...We bridge the gap between AI innovation and privacy...",
    status: "pending",
    createdAt: "2023-04-25T12:34:00Z",
    updatedAt: "2023-04-25T12:34:00Z",
  },
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    _id: "notif_001",
    type: "comment",
    actor: {
      _id: "usr_101",
      name: "Emerson Septimus",
      avatar: "/professional-woman-teal-avatar.jpg",
    },
    action: "commented on",
    target: '"Why Starting Your Career in Tech ....',
    targetType: "post",
    targetId: "blog_001",
    date: "25 April 2023",
    time: "12:34 PM",
    read: false,
  },
  {
    _id: "notif_002",
    type: "form",
    actor: {
      _id: "usr_001",
      name: "John Doe Enterprise",
      avatar: "/tech-company-logo.png",
      isCompany: true,
    },
    action: "submitted a form",
    targetType: "form",
    targetId: "form_001",
    date: "25 April 2023",
    time: "12:34 PM",
    read: false,
  },
  {
    _id: "notif_003",
    type: "share",
    actor: {
      _id: "usr_101",
      name: "Emerson Septimus",
      avatar: "/professional-woman-avatar.png",
    },
    action: "shared",
    target: '"Why Starting Your Career in Tech ....',
    targetType: "post",
    targetId: "blog_001",
    date: "25 April 2023",
    time: "12:34 PM",
    read: false,
  },
  {
    _id: "notif_004",
    type: "review",
    actor: {
      _id: "usr_002",
      name: "Maria Jones",
      avatar: "/professional-woman-brunette-avatar.jpg",
    },
    action: "reviewed",
    target: "John Doe Enterprise",
    targetType: "form",
    targetId: "form_001",
    date: "25 April 2023",
    time: "12:34 PM",
    read: true,
  },
  {
    _id: "notif_005",
    type: "published",
    actor: {
      _id: "usr_101",
      name: "Emerson Septimus",
      avatar: "/notification-bell-avatar.jpg",
    },
    action: "'s comment has been published",
    targetType: "post",
    targetId: "blog_001",
    date: "25 April 2023",
    time: "12:34 PM",
    read: true,
  },
  {
    _id: "notif_006",
    type: "response",
    actor: {
      _id: "usr_001",
      name: "John Doe Enterprise",
      avatar: "/company-logo-abstract.jpg",
      isCompany: true,
    },
    action: "has responded to the query from",
    target: "Maria Jones",
    targetType: "form",
    targetId: "form_001",
    date: "25 April 2023",
    time: "12:34 PM",
    read: true,
  },
]

// Generate more notifications for pagination
for (let i = 7; i <= 24; i++) {
  const types: Notification["type"][] = ["comment", "form", "share", "review", "response", "published"]
  const type = types[i % types.length]
  mockNotifications.push({
    _id: `notif_${String(i).padStart(3, "0")}`,
    type,
    actor: {
      _id: `usr_${100 + i}`,
      name: i % 2 === 0 ? "John Doe Enterprise" : "Emerson Septimus",
      avatar: `/placeholder.svg?height=40&width=40&query=avatar ${i}`,
      isCompany: i % 2 === 0,
    },
    action: type === "comment" ? "commented on" : type === "form" ? "submitted a form" : "shared",
    target: type !== "form" ? '"Why Starting Your Career in Tech ....' : undefined,
    targetType: type === "form" ? "form" : "post",
    targetId: type === "form" ? `form_${i}` : `blog_${i}`,
    date: "25 April 2023",
    time: "12:34 PM",
    read: i > 10,
  })
}

// Helper functions
export function getBlogPostById(id: string): BlogPost | undefined {
  return mockBlogPosts.find((post) => post._id === id)
}

export function getCommentsByPostId(postId: string): BlogComment[] {
  return mockBlogComments.filter((comment) => comment.postId === postId)
}

export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatNotificationDate(dateString: string): string {
  return dateString
}
