import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const dummyPosts = [
  {
    id: '1',
    title: 'How to implement authentication in React with JWT tokens?',
    excerpt: 'I am building a React application and need to implement JWT-based authentication. What are the best practices for storing tokens and handling refresh logic?',
    tags: ['react', 'jwt', 'authentication', 'security'],
    votes: 24,
    answers: 3,
    views: 1452,
    author: 'johndoe',
    authorAvatar: 'J',
    timeAgo: '2 hours ago',
  },
  {
    id: '2',
    title: 'TypeScript strict mode: what does `noUncheckedIndexedAccess` do?',
    excerpt: 'I recently enabled strict mode in my TypeScript project and noticed the `noUncheckedIndexedAccess` flag. Can someone explain what it does and how it affects object access?',
    tags: ['typescript', 'strict-mode'],
    votes: 18,
    answers: 2,
    views: 876,
    author: 'devgirl',
    authorAvatar: 'D',
    timeAgo: '5 hours ago',
  },
  {
    id: '3',
    title: 'Why is my CSS Grid not working in Firefox but works in Chrome?',
    excerpt: 'I have a simple grid layout that renders perfectly in Chrome but breaks in Firefox. I am using `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))`.',
    tags: ['css', 'grid', 'firefox', 'cross-browser'],
    votes: 32,
    answers: 5,
    views: 2103,
    author: 'cssmasta',
    authorAvatar: 'C',
    timeAgo: '1 day ago',
  },
  {
    id: '4',
    title: 'Understanding Laravel Service Providers and the container',
    excerpt: 'I am trying to wrap my head around how service providers work in Laravel. When should I create a custom service provider versus binding directly in AppServiceProvider?',
    tags: ['laravel', 'php', 'service-provider', 'ioc'],
    votes: 15,
    answers: 1,
    views: 654,
    author: 'phpdev99',
    authorAvatar: 'P',
    timeAgo: '2 days ago',
  },
  {
    id: '5',
    title: 'PostgreSQL: how to optimize a query with multiple JOINs on large tables?',
    excerpt: 'I have a query that JOINs 5 tables, each with millions of rows. Execution time is over 30 seconds. I already indexed the foreign key columns. What else can I try?',
    tags: ['postgresql', 'performance', 'query-optimization', 'indexing'],
    votes: 41,
    answers: 7,
    views: 3201,
    author: 'dba_expert',
    authorAvatar: 'D',
    timeAgo: '3 days ago',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      <div className="home-header">
        <h1>All Questions</h1>
        {user ? (
          <Link to="/questions/ask" className="btn btn-orange">Ask Question</Link>
        ) : (
          <Link to="/login" className="btn btn-primary">Log in to Ask</Link>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <span className="post-stats">12,345 questions</span>
        <div className="filter-bar">
          <button className="filter-btn active">Newest</button>
          <button className="filter-btn">Active</button>
          <button className="filter-btn">Bountied</button>
          <button className="filter-btn">Unanswered</button>
          <button className="filter-btn">Votes</button>
        </div>
      </div>

      {dummyPosts.map((post) => (
        <div key={post.id} className="post-item">
          <div className="post-votes">
            <span className="vote-count">{post.votes}</span>
            <span className="vote-label">votes</span>
            <span className="vote-count green">{post.answers}</span>
            <span className="vote-label">answers</span>
            <span>{post.views}</span>
            <span className="vote-label">views</span>
          </div>

          <div className="post-body">
            <div className="post-title">
              <Link to={`/questions/${post.id}`}>{post.title}</Link>
            </div>
            <div className="post-excerpt">{post.excerpt}</div>
            <div className="post-tags">
              {post.tags.map((tag) => (
                <Link key={tag} to={`/tags/${tag}`} className="tag">{tag}</Link>
              ))}
            </div>
            <div className="post-meta">
              <div className="post-author">
                <div className="post-author-avatar">{post.authorAvatar}</div>
                <Link to={`/users/${post.author}`}>{post.author}</Link>
                <span className="post-date">{post.timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
