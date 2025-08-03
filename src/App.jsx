import React, { useState, useEffect, useRef } from 'react';
import { Home, Compass, Bell, Mail, Bookmark, User, PlusSquare, Film, MoreHorizontal, MessageCircle, Repeat, Heart, PlayCircle, X, LogOut, Send, Trash2, Search, Video, UploadCloud, Link2, Users, Eye, Camera, UserPlus, Sprout, Zap, Dices, ImagePlus } from 'lucide-react';

// --- DB HELPER ---
const dbName = "WildCardDB";
const dbVersion = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('userImages')) {
        db.createObjectStore('userImages', { keyPath: 'username' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const getImageData = (db, username) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('userImages', 'readonly');
    const store = transaction.objectStore('userImages');
    const request = store.get(username);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const setImageData = (db, username, data) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('userImages', 'readwrite');
    const store = transaction.objectStore('userImages');
    const request = store.put({ username, ...data });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};


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

const ChoosePostTypeModal = ({ setShowModal }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-8 text-center relative">
            <button onClick={() => setShowModal({type: '', isOpen: false})} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How do you want to post?</h2>
            <div className="flex justify-around gap-4">
                <button onClick={() => setShowModal({type: 'post', isOpen: true})} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-1/3">
                    <Sprout size={32} className="mb-2 text-purple-500"/>
                    <h3 className="font-semibold">Feed Post</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Share with your followers and groups.</p>
                </button>
                <button onClick={() => setShowModal({type: 'wildcard', isOpen: true})} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-1/3">
                    <Zap size={32} className="mb-2 text-yellow-500"/>
                    <h3 className="font-semibold">Wild Card</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Share with a random audience to go viral.</p>
                </button>
                 <button onClick={() => setShowModal({type: 'challenge', isOpen: true})} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-1/3">
                    <Dices size={32} className="mb-2 text-green-500"/>
                    <h3 className="font-semibold">Challenge</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Respond to a random creative prompt.</p>
                </button>
            </div>
        </div>
    </div>
);


const CreatePostModal = ({ setShowModal, handleAddPost, currentUser, groupId, isWildCard, challengePrompt }) => {
    const [postContent, setPostContent] = useState(challengePrompt || '');
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    useEffect(() => {
        if(challengePrompt) {
            setPostContent('');
        }
    }, [challengePrompt]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Resize image before setting preview
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    setImagePreview(ctx.canvas.toDataURL('image/jpeg'));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePost = () => {
        if (!postContent.trim() && !imagePreview) return;
        const finalContent = challengePrompt ? `${postContent} #WildCardChallenge` : postContent;
        handleAddPost(finalContent, 'post', null, groupId, isWildCard, imagePreview);
        setShowModal({type: '', isOpen: false});
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
                <button onClick={() => setShowModal({type: '', isOpen: false})} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {challengePrompt ? 'Wild Card Challenge' : (isWildCard ? 'Create a Wild Card Post' : (groupId ? 'Post to Group' : 'Create Post'))}
                </h2>
                {challengePrompt && <p className="mb-2 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-800 dark:text-green-200">{challengePrompt}</p>}
                <textarea
                    className="w-full h-40 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                    placeholder="Post your thoughts!"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                ></textarea>
                {imagePreview && (
                    <div className="mt-4 relative">
                        <img src={imagePreview} alt="Post preview" className="rounded-lg max-h-60 w-full object-contain" />
                        <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full"><X size={16}/></button>
                    </div>
                )}
                <div className="flex justify-between items-center mt-4">
                    <button onClick={() => imageInputRef.current.click()} className="text-purple-500 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100 dark:hover:bg-gray-700">
                        <ImagePlus size={24} />
                    </button>
                    <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={handleImageChange} />
                    <button onClick={handlePost} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300" disabled={!postContent.trim() && !imagePreview}>Post</button>
                </div>
            </div>
        </div>
    );
};

const CreateVideoModal = ({ setShowModal, handleAddPost, currentUser }) => {
    const [uploadType, setUploadType] = useState('upload');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        } else {
            setError('Please select a valid video file.');
        }
    };

    const handlePost = () => {
        setError('');
        if (!description.trim()) {
            setError('Please add a description.');
            return;
        }

        let finalVideoSrc = '';
        if (uploadType === 'upload' && videoFile) {
            finalVideoSrc = previewUrl;
        } else if (uploadType === 'url' && videoUrl) {
            try {
                new URL(videoUrl);
                finalVideoSrc = videoUrl;
            } catch (_) {
                setError("Please enter a valid video URL.");
                return;
            }
        } else {
            setError('Please upload a video or provide a URL.');
            return;
        }

        handleAddPost(description, 'video', finalVideoSrc);
        setShowModal({type: '', isOpen: false});
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
                <button onClick={() => setShowModal({type: '', isOpen: false})} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post a Video</h2>
                
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button onClick={() => setUploadType('upload')} className={`flex-1 py-2 text-center font-semibold ${uploadType === 'upload' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}><UploadCloud className="inline-block mr-2" size={20}/> Upload</button>
                    <button onClick={() => setUploadType('url')} className={`flex-1 py-2 text-center font-semibold ${uploadType === 'url' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}><Link2 className="inline-block mr-2" size={20}/> URL</button>
                </div>

                {uploadType === 'upload' ? (
                    <div>
                        <label htmlFor="video-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <UploadCloud size={40} className="text-gray-400 mb-2"/>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{videoFile ? videoFile.name : 'Click to upload a video'}</p>
                        </label>
                        <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                        {previewUrl && <video controls src={previewUrl} className="mt-4 w-full rounded-lg bg-black"></video>}
                    </div>
                ) : (
                    <input type="url" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100" placeholder="Enter video URL (e.g., YouTube, Vimeo)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                )}

                <textarea className="w-full h-24 mt-4 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100" placeholder="Add a description and hashtags..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end mt-4">
                    <button onClick={handlePost} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300" disabled={!description.trim() || (uploadType === 'upload' && !videoFile) || (uploadType === 'url' && !videoUrl)}>Post Video</button>
                </div>
            </div>
        </div>
    );
};

const CreateGroupModal = ({ setShowModal, handleCreateGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = () => {
        if (!groupName.trim() || !description.trim()) return;
        handleCreateGroup({ name: groupName, description });
        setShowModal({ type: '', isOpen: false });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
                <button onClick={() => setShowModal({ type: '', isOpen: false })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create a Group</h2>
                <input type="text" placeholder="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full p-3 mb-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <textarea className="w-full h-28 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Group description..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
                <div className="flex justify-end mt-4">
                    <button onClick={handleCreate} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300" disabled={!groupName.trim() || !description.trim()}>Create Group</button>
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({ activeView, setActiveView, setShowModal, handleLogout, currentUser, notifications }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navItems = [
    { id: 'home', icon: Home, text: 'Home' },
    { id: 'videos', icon: Film, text: 'Videos' },
    { id: 'groups', icon: Users, text: 'Groups' },
    { id: 'explore', icon: Compass, text: 'Explore' },
    { id: 'notifications', icon: Bell, text: 'Notifications' },
    { id: 'messages', icon: Mail, text: 'Messages' },
    { id: 'bookmarks', icon: Bookmark, text: 'Bookmarks' },
    { id: 'profile', icon: User, text: 'Profile' },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <aside className="w-64 md:flex flex-col p-4 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 hidden">
      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-8">Wild Card</div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveView(item.id === 'profile' ? `profile-${currentUser.username}` : item.id)} className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors text-left w-full ${activeView === item.id || (activeView.startsWith('group-') && item.id === 'groups') || (activeView.startsWith('profile-') && item.id === 'profile') ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>
              )}
            </div>
            <span className="text-lg">{item.text}</span>
          </button>
        ))}
      </nav>
      <button onClick={() => setShowModal({type: 'choosePostType', isOpen: true})} className="mt-6 w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105">Post</button>
      <div className="mt-auto relative">
        {profileMenuOpen && (
            <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <button
                    onClick={() => {
                        handleLogout();
                        setProfileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                    <LogOut size={16} className="mr-2" />
                    Logout
                </button>
            </div>
        )}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <div onClick={() => setActiveView(`profile-${currentUser.username}`)} className="flex items-center space-x-3 cursor-pointer flex-grow">
                <img src={currentUser.profilePicture || `https://placehold.co/40x40/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}`} alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{currentUser.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{currentUser.username}</p>
                </div>
            </div>
            <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                onBlur={() => setTimeout(() => setProfileMenuOpen(false), 200)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
        </div>
      </div>
    </aside>
  );
};

const PostCard = ({ post, currentUser, handleInteraction, handleHashtagClick, handleGroupClick, groups, setActiveView }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const group = post.groupId ? groups.find(g => g.id === post.groupId) : null;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    handleInteraction(post.id, 'comment', commentText);
    setCommentText('');
  };

  const handlePlayVideo = () => {
      if (!hasViewed) {
          handleInteraction(post.id, 'view');
          setHasViewed(true);
      }
  };

  const renderContent = () => {
    const hashtagRegex = /(#\w+)/g;
    const parts = post.content.split(hashtagRegex);
    return parts.map((part, i) =>
      hashtagRegex.test(part) ? (
        <button key={i} onClick={() => handleHashtagClick(part)} className="text-purple-500 hover:underline">{part}</button>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex items-center mb-4">
        <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full object-cover mr-4" />
        <div>
          <div className="flex items-center">
            <p className="font-bold text-gray-900 dark:text-white">{post.user.name}</p>
            {post.isWildCard && <Zap size={16} className="ml-2 text-yellow-500" />}
          </div>
           <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <button onClick={() => setActiveView(`profile-${post.user.username}`)} className="hover:underline">@{post.user.username}</button>
                {group && (
                    <>
                        <span className="mx-1">in</span>
                        <button onClick={() => handleGroupClick(group.id)} className="hover:underline font-semibold text-purple-500">{group.name}</button>
                    </>
                )}
                <span className="mx-1">·</span>
                <span>{post.timestamp}</span>
            </div>
        </div>
        <div className="relative ml-auto">
            <button onClick={() => setMenuOpen(!menuOpen)} onBlur={() => setTimeout(() => setMenuOpen(false), 200)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
                <div className="absolute top-8 right-0 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10 w-40">
                    {post.user.username === currentUser.username && (
                        <button
                            onClick={() => handleInteraction(post.id, 'delete')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
      
      {post.type === 'video' && post.videoSrc && (
        <div className="aspect-video bg-black rounded-lg mb-2 overflow-hidden">
            <video controls src={post.videoSrc} onPlay={handlePlayVideo} className="w-full h-full"></video>
        </div>
      )}

      <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">{renderContent()}</p>
      
      {post.type === 'post' && post.image && <img src={post.image} alt="Post content" className="rounded-lg w-full object-cover max-h-96" />}
      
      <div className="flex justify-between items-center mt-4 text-gray-500 dark:text-gray-400">
        <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors" onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={22} /><span>{post.comments.length}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-green-500 transition-colors" onClick={() => handleInteraction(post.id, 'share')}>
          <Repeat size={22} /><span>{post.shares}</span>
        </button>
        <button className={`flex items-center space-x-2 transition-colors ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`} onClick={() => handleInteraction(post.id, 'like')}>
          <Heart size={22} fill={post.isLiked ? 'currentColor' : 'none'} /><span>{post.likes}</span>
        </button>
        {post.type === 'video' && (
            <div className="flex items-center space-x-2">
                <Eye size={22} /><span>{post.views}</span>
            </div>
        )}
        <button className={`transition-colors ${post.isBookmarked ? 'text-purple-500' : 'hover:text-purple-500'}`} onClick={() => handleInteraction(post.id, 'bookmark')}>
          <Bookmark size={22} fill={post.isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleAddComment} className="flex items-center space-x-2 mb-4">
            <img src={currentUser.profilePicture || `https://placehold.co/32x32/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}`} alt="Your avatar" className="w-8 h-8 rounded-full object-cover" />
            <input 
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <button type="submit" className="p-2 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-100 dark:hover:bg-gray-700">
              <Send size={20} />
            </button>
          </form>
          <div className="space-y-3">
            {post.comments.map((comment, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <img src={comment.user.avatar} alt={comment.user.username} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                  <span className="font-bold mr-2 text-gray-900 dark:text-white">{comment.user.username}</span>
                  <p className="inline text-gray-800 dark:text-gray-200">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StoriesReel = ({currentUser}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
            <div className="flex-shrink-0 text-center cursor-pointer group">
                <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-purple-600">
                    <img src={currentUser.profilePicture || `https://placehold.co/64x64/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}`} alt="Your Story" className="w-full h-full rounded-full border-2 border-white dark:border-gray-800 object-cover"/>
                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-800"><PlusSquare size={12} className="text-white" /></div>
                </div>
                <p className="text-xs mt-2 text-gray-700 dark:text-gray-300 truncate w-16">Your Story</p>
            </div>
        </div>
    </div>
  );
};

const PageHeader = ({ title, onAction, actionIcon, actionText }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 sm:rounded-t-xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {onAction && actionIcon && (
        <button onClick={onAction} className="flex items-center bg-purple-600 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition-colors">
          {React.createElement(actionIcon, { size: 20, className: "mr-2" })}
          {actionText}
        </button>
      )}
    </div>
  );
};

const PlaceholderContent = ({ title, message }) => {
  return (
    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
      <p className="mt-2">{message}</p>
    </div>
  );
};

const Feed = ({ posts, currentUser, handleInteraction, handleHashtagClick, groups, handleGroupClick, setActiveView, allUsers }) => {
  const userGroupIds = groups.filter(g => g.members.includes(currentUser.username)).map(g => g.id);
  
  // Get a few random Wild Card posts from people the user doesn't follow
  const wildCardPosts = posts
    .filter(p => p.isWildCard && p.user.username !== currentUser.username && !currentUser.following.includes(p.user.username))
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 3); // Take 3 random posts

  const feedPosts = posts
    .filter(p => {
        const isMyPost = p.user.username === currentUser.username;
        const isFromMyGroup = p.groupId && userGroupIds.includes(p.groupId);
        const isFromSomeoneIFollow = !p.groupId && currentUser.following.includes(p.user.username);
        return isMyPost || isFromMyGroup || isFromSomeoneIFollow;
    })
    .concat(wildCardPosts) // Add wild card posts to the feed
    .sort((a, b) => b.id - a.id);

  return (
    <>
      <PageHeader title="Home" />
      <StoriesReel currentUser={currentUser} />
      <div className="px-4 sm:px-0 pt-4">
        {feedPosts.length > 0 ? (
          feedPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} />)
        ) : (
          <PlaceholderContent title="Your feed is empty" message="Follow people or join groups to see posts here." />
        )}
      </div>
    </>
  );
};

const VideosFeed = ({ posts, currentUser, handleInteraction, setShowModal, handleHashtagClick, handleGroupClick, groups, setActiveView }) => {
  const videoPosts = posts.filter(p => p.type === 'video');
  return (
    <>
      <PageHeader title="Videos" onAction={() => setShowModal({type: 'video', isOpen: true})} actionIcon={Video} actionText="Post Video" />
      <div className="p-4">
        {videoPosts.length > 0 ? (
          videoPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} />)
        ) : (
          <PlaceholderContent title="No videos yet" message="When videos are shared, they will show up here." />
        )}
      </div>
    </>
  );
};

const ExplorePage = ({ posts, currentUser, handleInteraction, searchTerm, setSearchTerm, handleHashtagClick, handleGroupClick, groups, setActiveView, allUsers }) => {
    const isUserSearch = searchTerm.startsWith('@');
    const searchString = isUserSearch ? searchTerm.substring(1).toLowerCase() : searchTerm.toLowerCase().trim();
    
    const filteredPosts = !isUserSearch && searchTerm.trim() !== '' ? posts.filter(post => 
        post.content.toLowerCase().includes(searchString)
    ) : [];

    const filteredUsers = isUserSearch && searchString !== '' ? allUsers.filter(user =>
        user.username.toLowerCase().includes(searchString)
    ) : [];

    return (
        <>
            <PageHeader title="Explore" />
            <div className="p-4">
                <div className="relative mb-4">
                    <input 
                        type="text"
                        placeholder="Search users (@user) or hashtags (#react)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
                {filteredUsers.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-bold text-lg mb-2">Users</h3>
                        {filteredUsers.map(user => (
                            <div key={user.username} onClick={() => setActiveView(`profile-${user.username}`)} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                                <img src={user.profilePicture || `https://placehold.co/40x40/5C6BC0/FFFFFF?text=${user.username.charAt(0).toUpperCase()}`} alt={user.username} className="w-10 h-10 rounded-full object-cover mr-3" />
                                <div>
                                    <p className="font-semibold">{user.username}</p>
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {filteredPosts.length > 0 && (
                    <div>
                        <h3 className="font-bold text-lg mb-2">Posts</h3>
                        {filteredPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} />)}
                    </div>
                )}
                {searchTerm.trim() === '' && <PlaceholderContent title="Search for content or users" message="Find posts, videos, and people." />}
                {searchTerm.trim() !== '' && filteredPosts.length === 0 && filteredUsers.length === 0 && <PlaceholderContent title="No results found" message="Try a different search." />}
            </div>
        </>
    );
};

const BookmarksPage = ({ posts, currentUser, handleInteraction, handleHashtagClick, handleGroupClick, groups, setActiveView }) => {
    const bookmarkedPosts = posts.filter(post => post.isBookmarked);
    return (
        <>
            <PageHeader title="Bookmarks" />
            <div className="px-4 sm:px-0 pt-4">
                {bookmarkedPosts.length > 0 ? (
                    bookmarkedPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} />)
                ) : (
                    <PlaceholderContent title="No bookmarks" message="Save posts to find them easily later." />
                )}
            </div>
        </>
    );
};

const NotificationsPage = ({ notifications, setNotifications }) => {
    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({...n, read: true})));
    };
    
    const getNotificationMessage = (notification) => {
        const actionText = {
            like: 'liked your',
            comment: 'commented on your',
            share: 'shared your',
            follow: 'started following you'
        };
        const icon = {
            like: <Heart size={20} className="text-red-500"/>,
            comment: <MessageCircle size={20} className="text-blue-500"/>,
            share: <Repeat size={20} className="text-green-500"/>,
            follow: <UserPlus size={20} className="text-purple-500"/>
        }
        return (
            <div className="flex items-start space-x-3">
                <div className="mt-1">{icon[notification.type]}</div>
                <div>
                    <img src={notification.fromUser.avatar} alt={notification.fromUser.username} className="w-10 h-10 rounded-full object-cover" />
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-2">
                        <span className="font-bold">{notification.fromUser.username}</span> {actionText[notification.type]} {notification.post ? `post: "${notification.post.contentSnippet}"` : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.timestamp}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            <PageHeader title="Notifications" />
            <div className="p-4">
                {notifications.length > 0 ? (
                    <>
                        <button onClick={markAllAsRead} className="text-sm text-purple-600 dark:text-purple-400 mb-4">Mark all as read</button>
                        <div className="space-y-3">
                            {notifications.map(n => (
                                <div key={n.id} className={`p-3 rounded-lg ${!n.read ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                                  {getNotificationMessage(n)}
                                </div>
                            )).reverse() /* Show newest first */}
                        </div>
                    </>
                ) : (
                    <PlaceholderContent title="No new notifications" message="You're all caught up!" />
                )}
            </div>
        </>
    );
};

const GroupsPage = ({ groups, setActiveView, setShowModal }) => (
    <>
        <PageHeader title="Groups" onAction={() => setShowModal({type: 'group', isOpen: true})} actionIcon={PlusSquare} actionText="Create Group" />
        <div className="p-4">
            {groups.length > 0 ? (
                <div className="space-y-4">
                    {groups.map(group => (
                        <div key={group.id} onClick={() => setActiveView(`group-${group.id}`)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:border-purple-500">
                            <h3 className="font-bold text-lg">{group.name}</h3>
                            <p className="text-sm text-gray-500">{group.description}</p>
                            <p className="text-xs text-gray-400 mt-2">{group.members.length} members</p>
                        </div>
                    ))}
                </div>
            ) : (
                <PlaceholderContent title="No groups yet" message="Create the first group to start a community." />
            )}
        </div>
    </>
);

const GroupFeedPage = ({ group, posts, currentUser, handleInteraction, handleHashtagClick, handleJoinGroup, setShowModal, handleGroupClick, groups, setActiveView }) => {
    const isMember = group.members.includes(currentUser.username);
    const groupPosts = posts.filter(p => p.groupId === group.id);

    return (
        <>
            <PageHeader title={group.name} />
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
                <p className="text-sm text-gray-500 mt-2">{group.members.length} members</p>
                {!isMember && <button onClick={() => handleJoinGroup(group.id)} className="mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-full">Join Group</button>}
            </div>
            {isMember ? (
                <div className="px-4 sm:px-0 pt-4">
                    <button onClick={() => setShowModal({type: 'postInGroup', isOpen: true, groupId: group.id})} className="w-full mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-left text-gray-500">Post to {group.name}...</button>
                    {groupPosts.length > 0 ? (
                        groupPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} />)
                    ) : (
                        <PlaceholderContent title="No posts in this group yet" message="Be the first to share something!" />
                    )}
                </div>
            ) : (
                <PlaceholderContent title="Join this group" message="Become a member to see and create posts." />
            )}
        </>
    );
};

const ProfilePage = ({ profileUser, currentUser, posts, handleInteraction, handleHashtagClick, handleGroupClick, groups, handleUpdateUser, handleFollowToggle, setActiveView }) => {
    const userPosts = posts.filter(p => p.user.username === profileUser.username);
    const bannerInputRef = useRef(null);
    const profilePicInputRef = useRef(null);
    const isOwnProfile = currentUser.username === profileUser.username;
    const isFollowing = currentUser.following.includes(profileUser.username);

    const handleImageUpload = (event, type) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageData = reader.result;
                if (type === 'banner') {
                    handleUpdateUser({ ...currentUser, profileBanner: imageData });
                } else {
                    handleUpdateUser({ ...currentUser, profilePicture: imageData });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <div className="relative">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    {profileUser.profileBanner && <img src={profileUser.profileBanner} alt="Profile banner" className="w-full h-full object-cover" />}
                    {isOwnProfile && <button onClick={() => bannerInputRef.current.click()} className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"><Camera size={20} /></button>}
                    <input type="file" accept="image/*" ref={bannerInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} />
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-end -mt-20">
                        <div className="relative">
                            <img src={profileUser.profilePicture || `https://placehold.co/128x128/5C6BC0/FFFFFF?text=${profileUser.username.charAt(0).toUpperCase()}`} alt="User Avatar" className="w-32 h-32 rounded-full border-4 border-white dark:border-black object-cover" />
                           {isOwnProfile && <button onClick={() => profilePicInputRef.current.click()} className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"><Camera size={16} /></button>}
                            <input type="file" accept="image/*" ref={profilePicInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'picture')} />
                        </div>
                        {!isOwnProfile && (
                            <button onClick={() => handleFollowToggle(profileUser.username)} className={`font-bold py-2 px-4 rounded-full transition-colors ${isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                     <h2 className="text-2xl font-bold mt-4">{profileUser.username}</h2>
                     <p className="text-sm text-gray-500 dark:text-gray-400">@{profileUser.username}</p>
                     <div className="mt-4 flex space-x-6">
                        <div>
                            <p className="font-bold text-xl">{profileUser.profileViews}</p>
                            <p className="text-sm text-gray-500">Profile Views</p>
                        </div>
                        <div>
                            <p className="font-bold text-xl">{profileUser.followers.length}</p>
                            <p className="text-sm text-gray-500">Followers</p>
                        </div>
                        <div>
                            <p className="font-bold text-xl">{profileUser.following.length}</p>
                            <p className="text-sm text-gray-500">Following</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 sm:px-0 pt-4">
                {userPosts.length > 0 ? (
                    userPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} />)
                ) : (
                    <PlaceholderContent title="No posts yet" message="This user hasn't posted anything." />
                )}
            </div>
        </>
    );
};

const MainContent = ({ activeView, posts, currentUser, isTransitioning, handleInteraction, setShowModal, searchTerm, setSearchTerm, handleHashtagClick, notifications, setNotifications, groups, setActiveView, handleJoinGroup, handleGroupClick, handleUpdateUser, handleFollowToggle, allUsers }) => {
  const renderContent = () => {
    if (activeView.startsWith('group-')) {
        const groupId = parseInt(activeView.split('-')[1]);
        const group = groups.find(g => g.id === groupId);
        return group ? <GroupFeedPage group={group} posts={posts} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleJoinGroup={handleJoinGroup} setShowModal={setShowModal} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} /> : <GroupsPage groups={groups} setActiveView={setActiveView} setShowModal={setShowModal} />;
    }
    if (activeView.startsWith('profile-')) {
        const username = activeView.split('-')[1];
        const profileUser = allUsers.find(u => u.username === username);
        return profileUser ? <ProfilePage profileUser={profileUser} currentUser={currentUser} posts={posts} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} handleUpdateUser={handleUpdateUser} handleFollowToggle={handleFollowToggle} setActiveView={setActiveView} /> : <PlaceholderContent title="User not found" message="This profile does not exist." />;
    }
    switch (activeView) {
      case 'home': return <Feed posts={posts} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} groups={groups} handleGroupClick={handleGroupClick} setActiveView={setActiveView} />;
      case 'videos': return <VideosFeed posts={posts} currentUser={currentUser} handleInteraction={handleInteraction} setShowModal={setShowModal} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} />;
      case 'groups': return <GroupsPage groups={groups} setActiveView={setActiveView} setShowModal={setShowModal} />;
      case 'explore': return <ExplorePage posts={posts} currentUser={currentUser} handleInteraction={handleInteraction} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} allUsers={allUsers} />;
      case 'bookmarks': return <BookmarksPage posts={posts} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} setActiveView={setActiveView} />;
      case 'notifications': return <NotificationsPage notifications={notifications} setNotifications={setNotifications} />;
      case 'profile': return <ProfilePage profileUser={currentUser} currentUser={currentUser} posts={posts} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} handleGroupClick={handleGroupClick} groups={groups} handleUpdateUser={handleUpdateUser} handleFollowToggle={handleFollowToggle} setActiveView={setActiveView} />;
      case 'messages': return <><PageHeader title="Messages" /><PlaceholderContent title="No messages yet" message="Start a conversation with a friend." /></>;
      default: return <Feed posts={posts} currentUser={currentUser} handleInteraction={handleInteraction} handleHashtagClick={handleHashtagClick} groups={groups} handleGroupClick={handleGroupClick} setActiveView={setActiveView} />;
    }
  };
  return (
    <main className={`w-full md:w-full lg:w-2/5 xl:w-2/5 transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {renderContent()}
    </main>
  );
};

const Suggestions = () => {
  return (
    <aside className="w-80 p-4 sticky top-0 h-screen hidden lg:block">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Who to follow</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">No suggestions right now.</p>
      </div>
    </aside>
  );
};

const BottomNav = ({ activeView, setActiveView, setShowModal, currentUser }) => {
    const navItems = [{ id: 'home', icon: Home }, { id: 'videos', icon: Film }, { id: 'post', icon: PlusSquare }, { id: 'notifications', icon: Bell }, { id: 'profile', icon: User }];
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-20">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => {
                if (item.id === 'post') {
                    setShowModal({type: 'choosePostType', isOpen: true});
                } else if (item.id === 'profile') {
                    setActiveView(`profile-${currentUser.username}`);
                } else {
                    setActiveView(item.id);
                }
            }} 
            className={`p-2 rounded-full transition-colors ${activeView === item.id || (activeView.startsWith('profile-') && item.id === 'profile') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <item.icon size={28} />
          </button>
        ))}
      </nav>
    );
};

const WildCardApp = ({ handleLogout, currentUser, setCurrentUser, activeView, setActiveView, isTransitioning }) => {
  const [modal, setModal] = useState({type: '', isOpen: false});
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const challengePrompts = [
    "Share a photo of something older than you.",
    "What's a small thing that made you happy today?",
    "Post a video of a hidden gem in your city.",
    "Describe your perfect day in three words.",
    "Share a song you have on repeat right now."
  ];
  const [challenge, setChallenge] = useState('');

  // Load data from local storage on initial render
  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('wild-card-posts')) || [];
    setPosts(savedPosts);
    const savedNotifications = JSON.parse(localStorage.getItem(`wild-card-notifications-${currentUser.username}`)) || [];
    setNotifications(savedNotifications);
    const savedGroups = JSON.parse(localStorage.getItem('wild-card-groups')) || [];
    setGroups(savedGroups);
    const savedUsers = JSON.parse(localStorage.getItem('wild-card-users')) || [];
    setAllUsers(savedUsers);
  }, [currentUser.username]);

  // Save data to local storage whenever they change
  useEffect(() => { localStorage.setItem('wild-card-posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem(`wild-card-notifications-${currentUser.username}`, JSON.stringify(notifications)); }, [notifications, currentUser.username]);
  useEffect(() => { localStorage.setItem('wild-card-groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('wild-card-users', JSON.stringify(allUsers)); }, [allUsers]);

  const handleAddPost = (content, type, videoSrc = null, groupId = null, isWildCard = false, image = null) => {
    const newPost = {
        id: Date.now(), type, groupId, isWildCard, image,
        user: { name: currentUser.username, username: currentUser.username, avatar: currentUser.profilePicture || `https://placehold.co/50x50/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}` },
        content, videoSrc, likes: 0, isLiked: false, comments: [], shares: 0, isBookmarked: false, timestamp: 'Just now', views: 0
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleInteraction = (postId, type, data) => {
    if (type === 'delete') {
        setPosts(posts.filter(p => p.id !== postId));
        return;
    }
    
    let postAuthor = null;
    const updatedPosts = posts.map(post => {
        if (post.id === postId) {
            postAuthor = post.user.username;
            switch (type) {
                case 'like': return { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 };
                case 'bookmark': return { ...post, isBookmarked: !post.isBookmarked };
                case 'share': return { ...post, shares: post.shares + 1 };
                case 'view': return { ...post, views: (post.views || 0) + 1 };
                case 'comment':
                    const newComment = {
                        user: { username: currentUser.username, avatar: currentUser.profilePicture || `https://placehold.co/32x32/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}`},
                        text: data, timestamp: 'Just now'
                    };
                    return { ...post, comments: [...post.comments, newComment] };
                default: return post;
            }
        }
        return post;
    });
    setPosts(updatedPosts);

    if (postAuthor && postAuthor !== currentUser.username) {
        const post = updatedPosts.find(p => p.id === postId);
        const newNotification = {
            id: Date.now(), type,
            fromUser: { username: currentUser.username, avatar: currentUser.profilePicture || `https://placehold.co/40x40/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}` },
            post: { id: post.id, contentSnippet: post.content.substring(0, 30) + '...' },
            timestamp: 'Just now', read: false
        };
        const allNotifications = JSON.parse(localStorage.getItem(`wild-card-notifications-${postAuthor}`)) || [];
        localStorage.setItem(`wild-card-notifications-${postAuthor}`, JSON.stringify([...allNotifications, newNotification]));
    }
  };
  
  const handleHashtagClick = (tag) => {
    setSearchTerm(tag);
    setActiveView('explore');
  };

  const handleGroupClick = (groupId) => {
      setActiveView(`group-${groupId}`);
  }

  const handleCreateGroup = (groupData) => {
    const newGroup = {
        id: Date.now(),
        name: groupData.name,
        description: groupData.description,
        creator: currentUser.username,
        members: [currentUser.username]
    };
    setGroups(prevGroups => [...prevGroups, newGroup]);
  };

  const handleJoinGroup = (groupId) => {
    setGroups(groups.map(g => g.id === groupId ? {...g, members: [...g.members, currentUser.username]} : g));
  };

  const handleUpdateUser = async (updatedUserData) => {
    setCurrentUser(updatedUserData);
    
    const userForStorage = {...updatedUserData};
    delete userForStorage.profilePicture;
    delete userForStorage.profileBanner;
    localStorage.setItem('wild-card-current-user', JSON.stringify(userForStorage));

    const db = await openDB();
    const images = {};
    if (updatedUserData.profilePicture) images.profilePicture = updatedUserData.profilePicture;
    if (updatedUserData.profileBanner) images.profileBanner = updatedUserData.profileBanner;
    await setImageData(db, updatedUserData.username, images);

    const users = JSON.parse(localStorage.getItem('wild-card-users')) || [];
    const updatedUsers = users.map(u => u.username === updatedUserData.username ? userForStorage : u);
    localStorage.setItem('wild-card-users', JSON.stringify(updatedUsers));
  };
  
  const handleFollowToggle = (usernameToFollow) => {
    let updatedCurrentUser;
    const isFollowing = currentUser.following.includes(usernameToFollow);

    if (isFollowing) {
        updatedCurrentUser = { ...currentUser, following: currentUser.following.filter(name => name !== usernameToFollow) };
    } else {
        updatedCurrentUser = { ...currentUser, following: [...currentUser.following, usernameToFollow] };
    }
    
    const updatedAllUsers = allUsers.map(user => {
        if (user.username === currentUser.username) return updatedCurrentUser;
        if (user.username === usernameToFollow) {
            if(isFollowing) {
                return { ...user, followers: user.followers.filter(name => name !== currentUser.username) };
            } else {
                return { ...user, followers: [...user.followers, currentUser.username] };
            }
        }
        return user;
    });

    setAllUsers(updatedAllUsers);
    setCurrentUser(updatedCurrentUser);
    
    if(!isFollowing) {
        const newNotification = {
            id: Date.now(), type: 'follow',
            fromUser: { username: currentUser.username, avatar: currentUser.profilePicture || `https://placehold.co/40x40/5C6BC0/FFFFFF?text=${currentUser.username.charAt(0).toUpperCase()}` },
            timestamp: 'Just now', read: false
        };
        const allNotifications = JSON.parse(localStorage.getItem(`wild-card-notifications-${usernameToFollow}`)) || [];
        localStorage.setItem(`wild-card-notifications-${usernameToFollow}`, JSON.stringify([...allNotifications, newNotification]));
    }
  };
  
  useEffect(() => {
    if (modal.type === 'challenge' && modal.isOpen) {
        setChallenge(challengePrompts[Math.floor(Math.random() * challengePrompts.length)]);
    }
  }, [modal]);

  return (
    <>
      {modal.isOpen && modal.type === 'post' && <CreatePostModal setShowModal={setModal} handleAddPost={handleAddPost} currentUser={currentUser} />}
      {modal.isOpen && modal.type === 'wildcard' && <CreatePostModal setShowModal={setModal} handleAddPost={handleAddPost} currentUser={currentUser} isWildCard={true} />}
      {modal.isOpen && modal.type === 'challenge' && <CreatePostModal setShowModal={setModal} handleAddPost={handleAddPost} currentUser={currentUser} isWildCard={true} challengePrompt={challenge} />}
      {modal.isOpen && modal.type === 'postInGroup' && <CreatePostModal setShowModal={setModal} handleAddPost={handleAddPost} currentUser={currentUser} groupId={modal.groupId} />}
      {modal.isOpen && modal.type === 'video' && <CreateVideoModal setShowModal={setModal} handleAddPost={handleAddPost} currentUser={currentUser} />}
      {modal.isOpen && modal.type === 'group' && <CreateGroupModal setShowModal={setModal} handleCreateGroup={handleCreateGroup} />}
      {modal.isOpen && modal.type === 'choosePostType' && <ChoosePostTypeModal setShowModal={setModal} />}
      <div className="flex justify-center mx-auto">
        <Sidebar activeView={activeView} setActiveView={setActiveView} setShowModal={setModal} handleLogout={handleLogout} currentUser={currentUser} notifications={notifications} />
        <div className="flex-grow flex justify-center border-l border-r border-gray-200 dark:border-gray-800">
          <MainContent activeView={activeView} posts={posts} currentUser={currentUser} isTransitioning={isTransitioning} handleInteraction={handleInteraction} setShowModal={setModal} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleHashtagClick={handleHashtagClick} notifications={notifications} setNotifications={setNotifications} groups={groups} setActiveView={setActiveView} handleJoinGroup={handleJoinGroup} handleGroupClick={handleGroupClick} handleUpdateUser={handleUpdateUser} handleFollowToggle={handleFollowToggle} allUsers={allUsers} />
          <Suggestions />
        </div>
      </div>
      <BottomNav activeView={activeView} setActiveView={setActiveView} setShowModal={setModal} currentUser={currentUser} />
    </>
  );
};

// --- AUTH PAGE ---
const AuthPage = ({ setIsAuthenticated, setCurrentUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuthAction = () => {
        setError('');
        const users = JSON.parse(localStorage.getItem('wild-card-users')) || [];

        if (isLogin) {
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
            if (user) {
                localStorage.setItem('wild-card-current-user', JSON.stringify(user));
                setCurrentUser(user);
                setIsAuthenticated(true);
            } else {
                setError('Invalid username or password.');
            }
        } else {
            if (!username || !email || !password) {
                setError('Please fill all fields.');
                return;
            }
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                setError('An account with this email already exists.');
                return;
            }
            if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                setError('This username is already taken. Please choose another.');
                return;
            }
            const newUser = { username, email, password, profileViews: 0, followers: [], following: [] };
            users.push(newUser);
            localStorage.setItem('wild-card-users', JSON.stringify(users));
            localStorage.setItem('wild-card-current-user', JSON.stringify(newUser));
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
                    {isLogin ? (
                         <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    ) : (
                        <>
                         <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                         <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </>
                    )}
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

  // Seed a default admin user for development if no users exist
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('wild-card-users')) || [];
    if (users.length === 0) {
        const adminUser = { username: 'Admin', email: 'admin@wildcard.com', password: 'password', profileViews: 0, followers: [], following: [] };
        users.push(adminUser);
        localStorage.setItem('wild-card-users', JSON.stringify(users));
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
        let user = JSON.parse(localStorage.getItem('wild-card-current-user'));
        if (user) {
            try {
                const db = await openDB();
                const imageData = await getImageData(db, user.username);
                if (imageData) {
                    user = { ...user, ...imageData };
                }
            } catch (error) {
                console.error("Failed to load user images from DB", error);
            }
            setCurrentUser(user);
            setIsAuthenticated(true);
        }
    };
    loadUser();
    
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

  // Handle profile view count
  useEffect(() => {
    if (activeView.startsWith('profile-') && currentUser) {
        const profileUsername = activeView.split('-')[1];
        if (profileUsername !== currentUser.username) {
            const users = JSON.parse(localStorage.getItem('wild-card-users')) || [];
            const updatedUsers = users.map(u => {
                if (u.username === profileUsername) {
                    return { ...u, profileViews: (u.profileViews || 0) + 1 };
                }
                return u;
            });
            localStorage.setItem('wild-card-users', JSON.stringify(updatedUsers));
        }
    }
  }, [activeView, currentUser]);

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

  const handleUpdateUser = async (updatedUserData) => {
    setCurrentUser(updatedUserData);
    
    const userForStorage = {...updatedUserData};
    delete userForStorage.profilePicture;
    delete userForStorage.profileBanner;
    localStorage.setItem('wild-card-current-user', JSON.stringify(userForStorage));

    const db = await openDB();
    const images = {};
    if (updatedUserData.profilePicture) images.profilePicture = updatedUserData.profilePicture;
    if (updatedUserData.profileBanner) images.profileBanner = updatedUserData.profileBanner;
    await setImageData(db, updatedUserData.username, images);

    const users = JSON.parse(localStorage.getItem('wild-card-users')) || [];
    const updatedUsers = users.map(u => u.username === updatedUserData.username ? userForStorage : u);
    localStorage.setItem('wild-card-users', JSON.stringify(updatedUsers));
  };

  return (
    <div className={`min-h-screen font-sans bg-gray-50 dark:bg-black ${isDarkMode ? 'dark' : ''}`}>
      {showWelcome && <WelcomeModal setShowWelcome={setShowWelcome} username={currentUser?.username || ''} />}
      {isAuthenticated && currentUser ? (
        <WildCardApp 
          handleLogout={handleLogout} 
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          activeView={activeView}
          setActiveView={handleSetActiveView}
          isTransitioning={isTransitioning}
          handleUpdateUser={handleUpdateUser}
        />
      ) : (
        <AuthPage setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />
      )}
    </div>
  );
}
