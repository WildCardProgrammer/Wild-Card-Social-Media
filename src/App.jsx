import React, { useState, useEffect } from 'react';
import { Home, Compass, Bell, Mail, Bookmark, User, PlusSquare, Film, MoreHorizontal, MessageCircle, Repeat, Heart, PlayCircle, X, LogOut } from 'lucide-react';

// --- MOCK DATA ---

const initialPosts = [
  { id: 1, user: { name: 'Elena Voyage', username: 'elenavoyage', avatar: 'https://placehold.co/50x50/7E57C2/FFFFFF?text=EV' }, content: 'Just witnessed the most breathtaking sunset over the Grand Canyon. Nature is truly the greatest artist. 🌄 #travel #nature #sunset', image: 'https://placehold.co/600x400/A1887F/FFFFFF?text=Grand+Canyon', likes: 1247, comments: 89, shares: 45, timestamp: '2h' },
  { id: 2, user: { name: 'Code Master', username: 'codemaster', avatar: 'https://placehold.co/50x50/00897B/FFFFFF?text=CM' }, content: 'Excited to announce my new open-source project, "React-Flow-UI"! It simplifies building complex user interfaces with React. Check it out on GitHub! 💻 #reactjs #opensource #webdev', image: 'https://placehold.co/600x400/424242/FFFFFF?text=Code+Snippet', likes: 832, comments: 156, shares: 92, timestamp: '5h' },
  { id: 3, user: { name: 'Gourmet Guru', username: 'gourmetguru', avatar: 'https://placehold.co/50x50/F4511E/FFFFFF?text=GG' }, content: 'Perfected my sourdough recipe this weekend! The crust, the crumb... *chef\'s kiss*. Nothing beats the smell of freshly baked bread. 🥖 #baking #sourdough #foodie', image: 'https://placehold.co/600x400/FBC02D/333333?text=Sourdough+Bread', likes: 2301, comments: 432, shares: 112, timestamp: '1d' },
];

const videoData = [
  { id: 1, user: { name: 'TechExplainer', username: 'techexplainer', avatar: 'https://placehold.co/50x50/3F51B5/FFFFFF?text=TE' }, title: 'What is Quantum Computing? A Simple Explanation.', thumbnail: 'https://placehold.co/600x338/3F51B5/FFFFFF?text=Quantum+Video', views: '1.2M', timestamp: '3 days ago' },
  { id: 2, user: { name: 'DIY Crafts', username: 'diycrafts', avatar: 'https://placehold.co/50x50/E91E63/FFFFFF?text=DC' }, title: 'How to Create a Stunning Resin Art Coaster', thumbnail: 'https://placehold.co/600x338/E91E63/FFFFFF?text=Resin+Art', views: '876K', timestamp: '1 week ago' },
];

const stories = [
    { id: 1, user: { name: 'Your Story', avatar: 'https://placehold.co/64x64/5C6BC0/FFFFFF?text=U' }, isNew: true },
    { id: 2, user: { name: 'Elena V.', avatar: 'https://placehold.co/64x64/7E57C2/FFFFFF?text=EV' }, isNew: true },
];

const suggestions = [
    { id: 1, user: { name: 'Artisan Alex', username: 'artisan_alex', avatar: 'https://placehold.co/40x40/C2185B/FFFFFF?text=AA' } },
    { id: 2, user: { name: 'Fit Life Pro', username: 'fitlifepro', avatar: 'https://placehold.co/40x40/43A047/FFFFFF?text=FL' } },
];


// --- COMPONENTS ---

const WelcomeModal = ({ setShowWelcome, username }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center transform transition-all scale-100 opacity-100">
            <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">Welcome to Wild Card!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">We're excited to have you, {username}.</p>
            <button onClick={() => setShowWelcome(false)} className="bg-purple-600 text-white font-bold py-2 px-8 rounded-full hover:bg-purple-700 transition-colors">
                Get Started
            </button>
        </div>
    </div>
);

const CreatePostModal = ({ setShowModal, setPosts, currentUser }) => {
    const [postContent, setPostContent] = useState('');

    const handlePost = () => {
        if (!postContent.trim()) return;

        const newPost = {
            id: Date.now(),
            user: {
                name: currentUser.username,
                username: currentUser.username,
                avatar: `https://placehold.co/50x50/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}`,
            },
            content: postContent,
            image: null,
            likes: 0,
            comments: 0,
            shares: 0,
            timestamp: 'Just now',
        };

        setPosts(prevPosts => [newPost, ...prevPosts]);
        setShowModal(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Post</h2>
                <textarea
                    className="w-full h-40 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                    placeholder="What's happening?"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-4">
                    <button onClick={handlePost} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300" disabled={!postContent.trim()}>Post</button>
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({ activeView, setActiveView, setShowModal, handleLogout, currentUser }) => {
  const navItems = [
    { id: 'home', icon: Home, text: 'Home' },
    { id: 'videos', icon: Film, text: 'Videos' },
    { id: 'explore', icon: Compass, text: 'Explore' },
    { id: 'notifications', icon: Bell, text: 'Notifications' },
    { id: 'messages', icon: Mail, text: 'Messages' },
    { id: 'bookmarks', icon: Bookmark, text: 'Bookmarks' },
    { id: 'profile', icon: User, text: 'Profile' },
  ];

  return (
    <aside className="w-64 md:flex flex-col p-4 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 hidden">
      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-8">Wild Card</div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveView(item.id)} className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors text-left w-full ${activeView === item.id ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <item.icon className="w-6 h-6" />
            <span className="text-lg">{item.text}</span>
          </button>
        ))}
      </nav>
      <button onClick={() => setShowModal(true)} className="mt-6 w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105">Post</button>
      <div className="mt-auto">
        <button onClick={handleLogout} className="flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors text-left w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <LogOut className="w-6 h-6" />
            <span className="text-lg">Logout</span>
        </button>
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mt-2">
            <img src={`https://placehold.co/40x40/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}`} alt="User Avatar" className="w-10 h-10 rounded-full" />
            <div>
                <p className="font-semibold text-gray-900 dark:text-white">{currentUser.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{currentUser.username}</p>
            </div>
            <MoreHorizontal className="w-5 h-5 ml-auto text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </aside>
  );
};

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex items-center mb-4">
        <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full mr-4" />
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{post.user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{post.user.username} · {post.timestamp}</p>
        </div>
        <button className="ml-auto text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><MoreHorizontal size={20} /></button>
      </div>
      <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>
      {post.image && <img src={post.image} alt="Post content" className="rounded-lg w-full object-cover max-h-96" />}
      <div className="flex justify-between items-center mt-4 text-gray-500 dark:text-gray-400">
        <button className="flex items-center space-x-2 hover:text-blue-500"><MessageCircle size={22} /><span>{post.comments}</span></button>
        <button className="flex items-center space-x-2 hover:text-green-500"><Repeat size={22} /><span>{post.shares}</span></button>
        <button className={`flex items-center space-x-2 ${liked ? 'text-red-500' : 'hover:text-red-500'}`} onClick={() => setLiked(!liked)}><Heart size={22} fill={liked ? 'currentColor' : 'none'} /><span>{liked ? post.likes + 1 : post.likes}</span></button>
        <button className="hover:text-purple-500"><Bookmark size={22} /></button>
      </div>
    </div>
  );
};

const VideoCard = ({ video }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
      <div className="relative group cursor-pointer">
        <img src={video.thumbnail} alt={video.title} className="w-full h-auto object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <PlayCircle size={64} className="text-white text-opacity-80 transform group-hover:scale-110 transition-transform" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{video.title}</h3>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <img src={video.user.avatar} alt={video.user.name} className="w-6 h-6 rounded-full mr-2" />
          <span>{video.user.name}</span>
          <span className="mx-2">·</span>
          <span>{video.views} views</span>
          <span className="mx-2">·</span>
          <span>{video.timestamp}</span>
        </div>
      </div>
    </div>
  );
};


const StoriesReel = ({currentUser}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
            <div className="flex-shrink-0 text-center cursor-pointer group">
                <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-purple-600">
                    <img src={`https://placehold.co/64x64/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}`} alt="Your Story" className="w-full h-full rounded-full border-2 border-white dark:border-gray-800"/>
                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-800"><PlusSquare size={12} className="text-white" /></div>
                </div>
                <p className="text-xs mt-2 text-gray-700 dark:text-gray-300 truncate w-16">Your Story</p>
            </div>
            {stories.map(story => (
                <div key={story.id} className="flex-shrink-0 text-center cursor-pointer group">
                    <div className={`relative w-16 h-16 rounded-full p-1 ${story.isNew ? 'bg-gradient-to-tr from-yellow-400 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <img src={story.user.avatar} alt={story.user.name} className="w-full h-full rounded-full border-2 border-white dark:border-gray-800"/>
                    </div>
                    <p className="text-xs mt-2 text-gray-700 dark:text-gray-300 truncate w-16">{story.user.name}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

const PageHeader = ({ title }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 sm:rounded-t-xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
    </div>
  );
};

const PlaceholderContent = ({ title }) => {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Content for this section is coming soon!</p>
    </div>
  );
};

const Feed = ({ posts, currentUser }) => {
  return (
    <>
      <PageHeader title="Home" />
      <StoriesReel currentUser={currentUser} />
      <div className="px-4 sm:px-0">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </>
  );
};

const VideosFeed = () => {
  return (
    <>
      <PageHeader title="Videos" />
      <div className="p-4">
        {videoData.map(video => <VideoCard key={video.id} video={video} />)}
      </div>
    </>
  );
};

const MainContent = ({ activeView, posts, currentUser, isTransitioning }) => {
  const renderContent = () => {
    switch (activeView) {
      case 'home': return <Feed posts={posts} currentUser={currentUser} />;
      case 'videos': return <VideosFeed />;
      case 'explore': return <><PageHeader title="Explore" /><PlaceholderContent title="Explore" /></>;
      case 'notifications': return <><PageHeader title="Notifications" /><PlaceholderContent title="Notifications" /></>;
      case 'messages': return <><PageHeader title="Messages" /><PlaceholderContent title="Messages" /></>;
      case 'bookmarks': return <><PageHeader title="Bookmarks" /><PlaceholderContent title="Bookmarks" /></>;
      case 'profile': return <><PageHeader title="Profile" /><PlaceholderContent title="Your Profile" /></>;
      default: return <Feed posts={posts} currentUser={currentUser} />;
    }
  };
  return (
    <main className={`w-full md:w-full lg:w-1/2 xl:w-2/5 transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {renderContent()}
    </main>
  );
};

const Suggestions = () => {
  return (
    <aside className="w-80 p-4 sticky top-0 h-screen hidden lg:block">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Who to follow</h2>
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="flex items-center">
              <img src={suggestion.user.avatar} alt={suggestion.user.name} className="w-10 h-10 rounded-full mr-3" />
              <div className="flex-grow">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{suggestion.user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{suggestion.user.username}</p>
              </div>
              <button className="bg-black dark:bg-white text-white dark:text-black font-bold text-sm py-1.5 px-4 rounded-full hover:opacity-80 transition-opacity">Follow</button>
            </div>
          ))}
        </div>
        <a href="#" className="text-purple-600 dark:text-purple-400 text-sm mt-4 block">Show more</a>
      </div>
    </aside>
  );
};

const BottomNav = ({ activeView, setActiveView, setShowModal }) => {
    const navItems = [{ id: 'home', icon: Home }, { id: 'videos', icon: Film }, { id: 'post', icon: PlusSquare }, { id: 'notifications', icon: Bell }, { id: 'profile', icon: User }];
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-20">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => item.id === 'post' ? setShowModal(true) : setActiveView(item.id)} 
            className={`p-2 rounded-full transition-colors ${activeView === item.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <item.icon size={28} />
          </button>
        ))}
      </nav>
    );
};

const WildCardApp = ({ handleLogout, currentUser, activeView, setActiveView, isTransitioning }) => {
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState(initialPosts);

  return (
    <>
      {showModal && <CreatePostModal setShowModal={setShowModal} setPosts={setPosts} currentUser={currentUser} />}
      <div className="flex justify-center mx-auto">
        <Sidebar activeView={activeView} setActiveView={setActiveView} setShowModal={setShowModal} handleLogout={handleLogout} currentUser={currentUser} />
        <div className="flex-grow flex justify-center border-l border-r border-gray-200 dark:border-gray-800">
          <MainContent activeView={activeView} posts={posts} currentUser={currentUser} isTransitioning={isTransitioning} />
          <Suggestions />
        </div>
      </div>
      <BottomNav activeView={activeView} setActiveView={setActiveView} setShowModal={setShowModal} />
    </>
  );
};

// --- AUTH PAGE ---
const AuthPage = ({ setIsAuthenticated, setCurrentUser }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuthAction = () => {
        setError('');
        const users = JSON.parse(localStorage.getItem('wild-card-users')) || [];

        if (isLogin) {
            // Login logic
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('wild-card-current-user', JSON.stringify(user));
                setCurrentUser(user);
                setIsAuthenticated(true);
            } else {
                setError('Invalid email or password.');
            }
        } else {
            // Sign-up logic
            if (!username || !email || !password) {
                setError('Please fill all fields.');
                return;
            }
            if (users.some(u => u.email === email)) {
                setError('An account with this email already exists.');
                return;
            }
            const newUser = { username, email, password };
            users.push(newUser);
            localStorage.setItem('wild-card-users', JSON.stringify(users));
            localStorage.setItem('wild-card-current-user', JSON.stringify(newUser));
            // Flag that this is a new user to show welcome message
            localStorage.setItem('wild-card-is-new-user', 'true');
            setCurrentUser(newUser);
            setIsAuthenticated(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-purple-600 dark:text-purple-400 mb-2">Wild Card</h1>
                <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">{isLogin ? 'Log In' : 'Sign Up'}</h2>
                
                {error && <p className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-4 text-sm">{error}</p>}

                <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }} className="space-y-4">
                    {!isLogin && (
                        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    )}
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">{isLogin ? 'Log In' : 'Sign Up'}</button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-purple-600 dark:text-purple-400 hover:underline ml-1">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};


// --- APP ---

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('wild-card-current-user'));
    if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  useEffect(() => {
      // This effect runs when authentication status changes to check for new users.
      if (isAuthenticated) {
          const isNewUser = localStorage.getItem('wild-card-is-new-user') === 'true';
          if (isNewUser) {
              setShowWelcome(true);
              localStorage.removeItem('wild-card-is-new-user');
          }
      }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleLogout = () => {
      localStorage.removeItem('wild-card-current-user');
      setCurrentUser(null);
      setIsAuthenticated(false);
  };

  const handleSetActiveView = (view) => {
    if (view === activeView) return;

    setIsTransitioning(true);
    setTimeout(() => {
        setActiveView(view);
        setIsTransitioning(false);
    }, 300); // This duration should match the CSS transition duration
  };

  return (
    <div className={`min-h-screen font-sans bg-gray-50 dark:bg-black ${isDarkMode ? 'dark' : ''}`}>
      {showWelcome && <WelcomeModal setShowWelcome={setShowWelcome} username={currentUser?.username || ''} />}
      {isAuthenticated && currentUser ? (
        <WildCardApp 
          handleLogout={handleLogout} 
          currentUser={currentUser} 
          activeView={activeView}
          setActiveView={handleSetActiveView}
          isTransitioning={isTransitioning}
        />
      ) : (
        <AuthPage setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />
      )}
    </div>
  );
}
