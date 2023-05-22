import { Subject } from "rxjs";
import { Post } from "./post.model";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';
import { Router } from "@angular/router";
import { environment } from "src/environments/environments";

const BACKEND_URL = environment.apiURL + '/posts/';

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private posts: Post[] = [];
    private postUpdated = new Subject<{posts: Post[], postCount: number}>();

    constructor(private http: HttpClient, private router: Router) {}

    getPost(postPerPage: number, currentPage: number ){
        const queryParams = `?pageSize=${postPerPage}&page=${currentPage}`
        return this.http.get<{message:string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
        .pipe(map(postData => {
            return { 
                posts: postData.posts.map(post => {
                return {
                    title: post.title,
                    content: post.content,
                    id: post._id,
                    imagePath: post.imagePath,
                    creator: post.creator
                };
            }),
            maxPosts: postData.maxPosts
        };
    }))
        .subscribe((data) => {
            this.posts = data.posts;
            this.postUpdated.next({posts: [...this.posts], postCount: data.maxPosts});
        });
    }

    getPostUpdate(){
        return this.postUpdated.asObservable();
    }

    addPost( title: string, content: string, image: File){
        const postData = new FormData();
        postData.append("title",title);
        postData.append("content",content);
        postData.append("image",image, title);
        this.http.post<{message:string, post: Post}>(BACKEND_URL,postData).subscribe((data) => {
            this.router.navigate(['/']);
        });
    }

    deletePost(id: any){
        return this.http.delete<{message:string}>(BACKEND_URL+id);
    }

    getEditPost(id: string){
        return this.http.get<{_id:string; title: string; content: string; imagePath: any; creator: string}>(BACKEND_URL + id);
    }

    updatePost(id: string, title: string, content: string, image: any) {
        let postData: FormData | Post;
        if(typeof(image) === 'object'){
            postData = new FormData();
            postData.append("id", id);
            postData.append("title", title);
            postData.append("content", content);
            postData.append("image", image, title);
        } else{
            postData = { id: id, title: title, content: content, imagePath: image, creator: null};
        }
        this.http.put(BACKEND_URL + id, postData).subscribe(response => {
            this.router.navigate(['/']);
        });
    }
}