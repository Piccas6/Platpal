import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Heart, MessageCircle, Share2, UtensilsCrossed, MoreHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommunityFeed({ refreshTrigger = 0 }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const fetchCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const fetchPosts = async () => {
    try {
      const recentPosts = await base44.entities.CommunityPost.list('-created_date', 50);
      setPosts(recentPosts);
      
      // Cargar likes y comentarios iniciales
      const initialLikes = {};
      const initialComments = {};
      recentPosts.forEach(post => {
        initialLikes[post.id] = post.likes || [];
        initialComments[post.id] = post.comments || [];
      });
      setLikes(initialLikes);
      setComments(initialComments);
    } catch (error) {
      console.error("Error fetching community posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    const postLikes = likes[postId] || [];
    const hasLiked = postLikes.includes(currentUser.email);
    
    const updatedLikes = hasLiked 
      ? postLikes.filter(email => email !== currentUser.email)
      : [...postLikes, currentUser.email];

    // Actualizar localmente primero (optimistic update)
    setLikes(prev => ({...prev, [postId]: updatedLikes}));

    try {
      await base44.entities.CommunityPost.update(postId, {
        likes: updatedLikes
      });
    } catch (error) {
      console.error("Error updating likes:", error);
      // Revertir si falla
      setLikes(prev => ({...prev, [postId]: postLikes}));
    }
  };

  const handleComment = async (postId) => {
    if (!currentUser || !newComment[postId]?.trim()) return;

    const comment = {
      user_name: currentUser.full_name || 'Usuario',
      user_email: currentUser.email,
      text: newComment[postId].trim(),
      created_at: new Date().toISOString()
    };

    const updatedComments = [...(comments[postId] || []), comment];
    
    // Actualizar localmente
    setComments(prev => ({...prev, [postId]: updatedComments}));
    setNewComment(prev => ({...prev, [postId]: ''}));

    try {
      await base44.entities.CommunityPost.update(postId, {
        comments: updatedComments
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      // Revertir si falla
      setComments(prev => ({...prev, [postId]: comments[postId] || []}));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('¿Seguro que quieres eliminar esta publicación?')) return;

    try {
      await base44.entities.CommunityPost.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert('Error al eliminar la publicación');
    }
  };

  const canDelete = (post) => {
    if (!currentUser) return false;
    return post.created_by === currentUser.email || currentUser.app_role === 'admin';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-12 text-center">
          <UtensilsCrossed className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Todavía no hay actividad</p>
          <p className="text-gray-500 text-sm">¡Sé el primero en compartir tu experiencia!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {posts.map((post, index) => {
          const postLikes = likes[post.id] || [];
          const hasLiked = currentUser && postLikes.includes(currentUser.email);
          const postComments = comments[post.id] || [];
          const showCommentSection = showComments[post.id];

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                <CardContent className="p-0">
                  {/* Header del post */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                        {post.user_avatar || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{post.user_name}</span>
                          {post.type === 'automatic' && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-xs border-emerald-200">
                              <UtensilsCrossed className="w-3 h-3 mr-1" />
                              Salvó un menú
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(post.created_date)}
                        </span>
                      </div>
                    </div>

                    {canDelete(post) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Contenido del post */}
                  <div className="px-4 pb-3">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.message}</p>
                  </div>

                  {/* Imagen */}
                  {post.image_url && (
                    <div className="w-full">
                      <img 
                        src={post.image_url} 
                        alt="Post" 
                        className="w-full max-h-[500px] object-cover"
                      />
                    </div>
                  )}

                  {/* Estadísticas de interacciones */}
                  {(postLikes.length > 0 || postComments.length > 0) && (
                    <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-600 border-b">
                      <button 
                        className="hover:underline"
                        onClick={() => postLikes.length > 0 && alert(`Les gusta a: ${postLikes.join(', ')}`)}
                      >
                        {postLikes.length > 0 && `${postLikes.length} ${postLikes.length === 1 ? 'like' : 'likes'}`}
                      </button>
                      <button 
                        className="hover:underline"
                        onClick={() => setShowComments(prev => ({...prev, [post.id]: !showCommentSection}))}
                      >
                        {postComments.length > 0 && `${postComments.length} ${postComments.length === 1 ? 'comentario' : 'comentarios'}`}
                      </button>
                    </div>
                  )}

                  {/* Botones de interacción */}
                  <div className="flex items-center gap-1 px-2 py-2 border-b">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex-1 gap-2 transition-all duration-300 ${
                        hasLiked 
                          ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                          : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline font-semibold">Me gusta</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                      onClick={() => setShowComments(prev => ({...prev, [post.id]: !showCommentSection}))}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="hidden sm:inline font-semibold">Comentar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 gap-2 text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-300"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('¡Enlace copiado!');
                      }}
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="hidden sm:inline font-semibold">Compartir</span>
                    </Button>
                  </div>

                  {/* Sección de comentarios */}
                  <AnimatePresence>
                    {showCommentSection && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-gray-50 space-y-3 max-h-64 overflow-y-auto">
                          {postComments.map((comment, idx) => (
                            <div key={idx} className="flex gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {comment.user_name?.[0] || '?'}
                              </div>
                              <div className="flex-1 bg-white rounded-2xl px-3 py-2 shadow-sm">
                                <p className="font-semibold text-sm text-gray-900">{comment.user_name}</p>
                                <p className="text-sm text-gray-700">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Input de comentario */}
                        {currentUser && (
                          <div className="px-4 py-3 bg-gray-50 border-t flex gap-2">
                            <Textarea
                              placeholder="Escribe un comentario..."
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({...prev, [post.id]: e.target.value}))}
                              className="min-h-[40px] max-h-[100px] resize-none text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleComment(post.id);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                              className="bg-emerald-600 hover:bg-emerald-700 self-end"
                            >
                              Enviar
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}