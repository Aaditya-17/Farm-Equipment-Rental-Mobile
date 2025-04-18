import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    TextInput,
    Button,
    Modal,
    StyleSheet,
} from "react-native";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "../context/UserContext";

const API_URL =
    "https://famerequipmentrental-springboot-production.up.railway.app";

const HomeScreen = () => {
    const [posts, setPosts] = useState([]);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [likes, setLikes] = useState({});
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const currentPost = posts[currentPostIndex];
    const { user } = useUser();
    const userId = user?.id;
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts/all`);
            setPosts(response.data.reverse());
        } catch (error) {
            console.error(error);
        }
    };

    const handleLike = async (postId) => {
        try {
            await axios.post(`${API_URL}/posts/like/${postId}/${userId}`);
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              likes: likes[postId]
                                  ? post.likes - 1
                                  : post.likes + 1,
                          }
                        : post
                )
            );
            setLikes((prev) => ({ ...prev, [postId]: !prev[postId] }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleNextPost = () => {
        setCurrentPostIndex((prev) => (prev < posts.length - 1 ? prev + 1 : 0));
        setCurrentImageIndex(0);
    };

    const handlePrevImage = () => {
        if (!currentPost) return;
        setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : currentPost.imageUrls.length - 1
        );
    };

    const handleNextImage = () => {
        if (!currentPost) return;
        setCurrentImageIndex((prev) =>
            prev < currentPost.imageUrls.length - 1 ? prev + 1 : 0
        );
    };

    const fetchComments = async (postId) => {
        try {
            const response = await axios.get(
                `${API_URL}/posts/comments/${postId}`
            );
            setComments(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCommentSubmit = async (postId) => {
        if (!newComment.trim()) return;
        try {
            await axios.post(`${API_URL}/posts/addComment`, {
                postId,
                ownerId: 1,
                text: newComment,
            });
            fetchComments(postId);
            setNewComment("");
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(
                `${API_URL}/posts/comment/delete/${commentId}/1`
            );
            fetchComments(currentPost.id);
        } catch (error) {
            console.error(error);
        }
    };

    if (!currentPost)
        return <Text style={styles.centerText}>No Posts Available</Text>;

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <TouchableOpacity
                    onPress={handlePrevImage}
                    style={styles.arrowButton}
                >
                    <FontAwesome name="arrow-left" size={24} color="black" />
                </TouchableOpacity>

                <Image
                    source={{
                        uri: `${API_URL}${currentPost.imageUrls[currentImageIndex]}`,
                    }}
                    style={styles.image}
                    resizeMode="cover"
                />

                <TouchableOpacity
                    onPress={handleNextImage}
                    style={styles.arrowButton}
                >
                    <FontAwesome name="arrow-right" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <Text style={styles.usernameText}>
                <FontAwesome name="user" size={20} />{" "}
                {currentPost.ownerName || "Farmer"}
            </Text>
            <Text style={styles.captionText}>{currentPost.text}</Text>

            <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => handleLike(currentPost.id)}>
                    <FontAwesome
                        name={likes[currentPost.id] ? "heart" : "heart-o"}
                        size={30}
                        color="red"
                    />
                </TouchableOpacity>
                <Text style={styles.likesText}>{currentPost.likes}</Text>

                <TouchableOpacity
                    onPress={() => {
                        setCommentsModalVisible(true);
                        fetchComments(currentPost.id);
                    }}
                >
                    <FontAwesome name="comment-o" size={30} color="black" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleNextPost}
                style={styles.nextPostButton}
            >
                <FontAwesome name="arrow-down" size={24} color="white" />
            </TouchableOpacity>

            {/* Comments Modal */}
            <Modal
                visible={commentsModalVisible}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Button
                            title="Close"
                            onPress={() => setCommentsModalVisible(false)}
                        />
                        <FlatList
                            data={comments}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.commentItem}>
                                    <Text>{item.text}</Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleDeleteComment(item.id)
                                        }
                                    >
                                        <FontAwesome
                                            name="trash"
                                            size={20}
                                            color="red"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        <TextInput
                            value={newComment}
                            onChangeText={setNewComment}
                            placeholder="Add a comment"
                            style={styles.input}
                        />
                        <Button
                            title="Submit"
                            onPress={() => handleCommentSubmit(currentPost.id)}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const PostScreen = () => {
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState("");

    const handleChooseImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleUpload = async () => {
        if (!image) return;

        const formData = new FormData();
        formData.append("file", {
            uri: image.uri,
            name: image.fileName || "photo.jpg",
            type: image.type || "image/jpeg",
        });

        try {
            const uploadResponse = await axios.post(
                `${API_URL}/api/files/upload`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            const imageId = uploadResponse.data.id;

            await axios.post(`${API_URL}/posts/create`, {
                text: caption,
                ownerId: 1,
                imageIds: imageId.toString(),
            });

            setImage(null);
            setCaption("");
            alert("Post created!");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Choose Image" onPress={handleChooseImage} />
            {image && (
                <Image source={{ uri: image.uri }} style={styles.image} />
            )}
            <TextInput
                placeholder="Write a caption"
                value={caption}
                onChangeText={setCaption}
                style={styles.input}
            />
            <Button title="Post" onPress={handleUpload} />
        </View>
    );
};

const ProfileScreen = () => {
    const [profilePosts, setProfilePosts] = useState([]);

    useEffect(() => {
        fetchProfilePosts();
    }, []);

    const fetchProfilePosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts/owner/1`);
            setProfilePosts(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <FlatList
            data={profilePosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.profilePost}>
                    {item.imageUrls?.[0] && (
                        <Image
                            source={{ uri: `${API_URL}${item.imageUrls[0]}` }}
                            style={styles.profileImage}
                        />
                    )}
                    <Text style={styles.captionText}>{item.text}</Text>
                    <Text>Likes: {item.likes}</Text>
                    <Text>Comments: {item.comments}</Text>
                </View>
            )}
        />
    );
};

export default function FarmGram() {
    return <HomeScreen />;
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "white" },
    imageContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    image: { width: 300, height: 300, margin: 10, borderRadius: 10 },
    arrowButton: { marginHorizontal: 5 },
    usernameText: { fontWeight: "bold", fontSize: 16, textAlign: "center" },
    captionText: { marginTop: 5, textAlign: "center" },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
    },
    likesText: { marginHorizontal: 10 },
    nextPostButton: {
        backgroundColor: "green",
        padding: 10,
        borderRadius: 50,
        alignSelf: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    commentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    profilePost: {
        margin: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: "#f9f9f9",
    },
    profileImage: { width: "100%", height: 200, borderRadius: 10 },
    centerText: { textAlign: "center", marginTop: 50, fontSize: 18 },
});
