import React , {useState , useEffect , useContext} from 'react'
import './Home.css'
import M from 'materialize-css';
import {UserContext} from '../App'
import { Link } from 'react-router-dom';

function Home() {//home page

    const [posts, setPosts] = useState([]); //initialize posts as empty array
    const {state, dispatch} = useContext(UserContext);  //get the user context
    
    useEffect(()=>{
      //call to create post api
      fetch("/api/posts",{
        method: "GET",
        headers: {
          "Authorization": "Bearer "+localStorage.getItem("token")
        },
      })
      .then((response)=>response.json())
      .then(function(data){
        console.log(data);
          console.log(data);
          setPosts(data.posts);
      }).catch(error => {
        console.error("Error:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
    });
          
  },[]);//we want to lad only once when component is mounting/loading thats why an empty array is passed
  
  const likeUnlike = (postId, url) => {
    fetch(`/api${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ postId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Updated Post:", data);

        // Update post state
        setPosts((prevPosts) =>
          prevPosts.map((oldPost) =>
            oldPost._id === data._id ? data : oldPost
          )
        );
      })
      .catch((error) => {
        console.error("Error updating likes:", error);
        M.toast({
          html: "Something went wrong!",
          classes: "#c62828 red darken-3",
        });
      });
  };

  const deletePost = (postId) => {
    fetch(`/api/deletepost/${postId}`, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.error) {
          M.toast({ html: "Failed to delete post!", classes: "#c62828 red darken-3" });
          return;
        }

        const newPostArr = posts.filter((oldPost) => oldPost._id !== postId);
        setPosts(newPostArr);
        M.toast({ html: "Post deleted successfully!", classes: "#43a047 green darken-1" });

      })
      .catch(error => {
        console.error("Error:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
  };

  const deleteComment = (postId, commentId) => {
    fetch(`/api/deletecomment/${postId}/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);

        if (data.error) {
          M.toast({ html: "Failed to delete comment!", classes: "#c62828 red darken-3" });
          return;
        }

        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId
              ? { ...post, comments: post.comments.filter(c => c._id !== commentId) }
              : post
          )
        );

        M.toast({ html: "Comment deleted successfully!", classes: "#43a047 green darken-1" });
      })
      .catch(error => {
        console.error("Error:", error);
        M.toast({ html: "Something went wrong!", classes: "#c62828 red darken-3" });
      });
};


  const submitComment = (event, postId) => {
    event.preventDefault(); // Avoid page refresh
    const commentText = event.target[0].value; // Get comment text
  
    console.log("Submitting comment:", commentText, "For Post:", postId); // Debugging log
  
    if (!commentText.trim()) return; // Prevent empty comments
  
    fetch("/api/comment", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ commentText, postId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Updated Post (After Comment):", data);
  
        setPosts((prevPosts) =>
          prevPosts.map((oldPost) =>
            oldPost._id === data._id ? data : oldPost
          )
        );
  
        event.target.reset(); // Clear input field
      })
      .catch((error) => {
        console.error("Error submitting comment:", error);
        M.toast({
          html: "Something went wrong!",
          classes: "#c62828 red darken-3",
        });
      });
  };
  
  
  return (
    <div className='home-container'>
      {
        posts.map((post)=>{
          return(
            <div className='card home-card' key={post._id}>
                <h5 style={{padding:"10px"}}>
                  <Link to={post.author._id !== state._id ?"/profile/"+post.author._id:"/profile"}>{post.author?.fullName || "Unknown Author"}</Link>

                  {post.author._id === state._id 
                  && <i onClick={()=>deletePost(post._id)} className="material-icons" style={{color:"red" , cursor: "pointer" , float: "right" , fontSize: "30px"}}>delete_forever</i> }
                </h5>
                <div className='card-image'>
                    <img  src={post.image} alt="" />
                </div>
                <div className='card-content'>
                  <i className="material-icons" style={{color:"red" , marginRight: "10px"}}>favorite</i>
                  {
                    post.likes.includes(state._id)
                    ?<i onClick={()=>likeUnlike(post._id , '/unlike')} className="material-icons" style={{color:"red" , cursor: "pointer"}}>thumb_down</i>
                    :<i onClick={()=>likeUnlike(post._id , '/like')} className="material-icons" style={{color:"blue" ,marginRight: "10px" , cursor: "pointer"}}>thumb_up</i>
                  }
                  <h6>{post.likes.length} likes</h6>
                  <h6>{post.title}</h6>
                  <p>{post.body}</p>
                  {
                    post.comments.length > 0
                    ?<h6 style={{ fontWeight: '600' }}>All Comments</h6>
                    :""
                  }
                  {
                    post.comments.map((comment) => {
                      return (
                        <div 
                          key={comment._id} 
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            padding: "5px 0",
                            borderBottom: "1px solid #ddd"
                          }}
                        >
                          {/* Comment Text Section */}
                          <div style={{ flexGrow: 1 }}>
                            <span style={{ fontWeight: "500", marginRight: "10px" }}>
                              {comment.commentedBy.fullName}
                            </span>
                            <span>{comment.commentText}</span>
                          </div>

                          {/* Delete Icon (Only for Author) */}
                          {comment.commentedBy._id === state._id && (
                            <i
                              onClick={() => deleteComment(post._id, comment._id)}
                              className="material-icons"
                              style={{ color: "red", cursor: "pointer", fontSize: "20px" }}
                            >
                              delete
                            </i>
                          )}
                        </div>
                      );
                    })
                  }

                  <form onSubmit={(event)=>submitComment(event , post._id)}>
                    <input type="text" placeholder='Enter comment'/>
                  </form>
                </div>
            </div>
          )
        })
      }
      

    </div>
    
  )
}

export default Home