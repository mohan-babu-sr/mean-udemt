import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { FormControl, FormGroup, Validator, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { PostService } from '../post.service';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit, OnDestroy{
    enteredTitle = '';
    enteredContent = '';
    post: Post;
    isLoading = false;
    form: FormGroup;
    imagePreview: any;
    private mode = 'create';
    private postId: string;
    private authStatusSubs: Subscription;

    constructor(public postService: PostService, public route: ActivatedRoute, private authService: AuthService) {}
    
    onSavePost(){
        // if (this.form.invalid) {
        //     return;
        // }
        this.isLoading = true;
        if(this.mode === 'create'){
            this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
        }else{
            this.postService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
        }
        this.form.reset();
    }

    onImagePicked(event: Event){
        const file = (event.target as HTMLInputElement).files[0];
        this.form.patchValue({image: file});
        this.form.get('image').updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result;
        }
        reader.readAsDataURL(file);
    }

    ngOnInit(): void {
        this.authStatusSubs = this.authService.getAuthStatusListener().subscribe(authStatus => {
            this.isLoading = false;
        })
        this.form = new FormGroup({
            'title': new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
            'content': new FormControl(null, {validators: [Validators.required]}),
            'image': new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
        });
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if(paramMap.has('postId')){
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                this.isLoading = true;
                this.postService.getEditPost(this.postId).subscribe(post => {
                    console.log(post);
                    this.isLoading = false;
                    this.post = {id: post._id,title:post.title, content:post.content, imagePath: post.imagePath, creator: post.creator};
                    this.form.setValue({
                        'title': post?.title,
                        'content': post?.content,
                        'image': post?.imagePath,
                        'creator': post?.creator
                    });
                });
            }else{
                this.mode = 'create';
                this.postId = null;
            }
        })
    }

    ngOnDestroy(): void {
        this.authStatusSubs.unsubscribe();
    }
}
