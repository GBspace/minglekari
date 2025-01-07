import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { ID, ImageGravity, Query } from 'appwrite'; 

const createUserAccount = async (user: INewUser) => {
    try {
        const newAccount = await account.create(
            ID.unique(), 
            user.email, 
            user.password, 
            user.name
        );
        if(!newAccount) throw Error;
        
const avatarUrl = avatars.getInitials(user.name);
const newUser = await saveUserToDB({
    accountId: newAccount.$id,
    email: newAccount.email,
    name: newAccount.name,
    username: user.username,
    imageUrl: avatarUrl
});
        return newUser;
    } catch(e) {
        console.log(e);
        return e;
    }

}

const saveUserToDB = async (user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: string;
    username?: string;
}) => {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        );
        return newUser;
    }
    catch(e) {
        console.log(e);
    }
}

export const signInAccount = async (user: { 
          email: string; 
          password: string;
        }) => {
    try {
       
        const session = await account.createEmailPasswordSession(user.email, user.password);
        return session;
    }
    catch(e) {
        console.log(e);
    }

}

export const signOutAccount = async () => {
    try {
          const session = await account.deleteSession("current");          
          console.log(session);
          return session;
        
        }
    catch(e) {
        console.log(e);
    }

}

export const getCurrentUser = async() => {
    try{
        const currentAccount = await account.get();
        if(!currentAccount) {
            throw Error;
        }
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if(!currentUser) throw Error;
        return currentUser.documents[0];
    }
    catch(e) {
        console.log(e);
    }
}

export const createPost = async (post: INewPost) => {
    try {

        const uploadedFile = await uploadFile(post.file[0]);
        if(!uploadedFile) throw Error;

        const fileUrl =  getFilePreview(uploadedFile.$id);
        console.log('GB ', fileUrl);
        if(!fileUrl) {
            const response = await deleteFile(uploadedFile.$id);
            if(response?.status !== 'ok') throw Error('unable to delete the fle');
            throw Error;
        }

        const tags = post.tags?.replace(/ /g, '').split(',') || [];
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption:post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );
        if(!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }
        return newPost;
    }
    catch(e) {
        console.log(e);
    }
}

export const deleteFile = async (fileId: string) => {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return {status: 'ok'}
    }
    catch(e) {
        console.log(e);
    }

}

export const getFilePreview = (fileId: string) => {
    try {
        const fileUrl =  storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            ImageGravity.Top,
            100
        );

        return fileUrl;
    }
    catch(e) {
    console.log(e);
    }
}

export const uploadFile = async (file: File) => {
    try{
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    }
    catch(error) {
        console.log(error);
    }
}

export const getRecentPosts = async () => {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    );
    if(!posts) {
        throw Error;
    }
    return posts;
}

export const likePost = async (postId: string, likesArray: string[]) => {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        );
        if(!updatedPost) throw Error;
        return updatedPost;
    }
    catch(e) {
        console.log(e);
    }
}

export const savePost = async (postId: string, userId: string) => {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.saveCollectionId,
            ID.unique(),
            {
                users: userId,
                post: postId
            }
        );
        if(!updatedPost) throw Error;
        return updatedPost;
    }
    catch(e) {
        console.log(e);
    }
}

export const deleteSavedPost = async (savedRecordId: string) => {
   console.log('savedRecordId ', savedRecordId);
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.saveCollectionId,
            savedRecordId,
        );
        if(!statusCode) throw Error;
        return {status: 'ok'};
    }
    catch(e) {
        console.log(e);
    }
}

export const getPostById = async (postId: string) => {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );
        return post;
    }
    catch(e) {
        console.log(e);
    }

}

export const updatePost = async (post: IUpdatePost) => {
        const hasFileToUpdate = post.file.length > 0;
      
        try {
            let image = {
                imageUrl: post.imageUrl,
                imageId: post.imageId,
            };

            if (hasFileToUpdate) {

            // Upload new file to appwrite storage
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error;

            // Get new file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
            }
const tags = post.tags?.replace(/ /g, '').split(',') || [];
                const updatedPost = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.postCollectionId,
                post.postId,
                {
                    
                    caption:post.caption,
                    imageUrl: image.imageUrl,
                    imageId: image.imageId,
                    location: post.location,
                    tags: tags,
                }
            );
            if(!updatedPost) {
                await deleteFile(post.imageId);
                throw Error;
            }
            return updatedPost;
        
    }

    catch(e) {
        console.log(e);
    }
}

export const deletePost = async (postId: string, imageId: string) => {
    if(!postId || !imageId) {
        throw Error;
    }
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );
        return {status: 'ok'};
    }catch(e){
        console.log(e);
    }
}


export const getInfinitePosts = async({pageParams}: {pageParams: number}) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)];
    if(pageParams) {
        queries.push(Query.cursorAfter(pageParams.toString()));
    }
    try {
        const posts = await databases.listDocuments(
              appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        );
        if(!posts) throw Error;
        return posts;
    } 
    catch(e) {
        console.log(e);
    }
}

export const searchPosts = async({searchTerm}: {searchTerm: string}) => {
   
    try {
        const posts = await databases.listDocuments(
              appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        );
        if(!posts) throw Error;
        return posts;
    } 
    catch(e) {
        console.log(e);
    }
}

export default createUserAccount;