import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Post } from '../../post.model';
import { PostService } from '../../post.service';
import { Subscription } from "rxjs";
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{
  panelOpenState = false;

  // post = [
  //   {title: 'Post 1', content: '1st content'},
  //   {title: 'Post 2', content: '2st content'},
  //   {title: 'Post 3', content: '3st content'}
  // ];
  post: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  userId: string;

  private postSub: Subscription;
  private authListenerSubs: Subscription;
  userIsAuthenticated = false;

  constructor(public postService: PostService, private authService: AuthService) {
    
  }

  ngOnInit(): void {
    this.postService.getPost(this.postPerPage, this.currentPage);
    this.isLoading = true;
    this.postSub = this.postService.getPostUpdate().subscribe((postData: {posts: Post[], postCount: number})=>{
      this.post = postData.posts;
      this.isLoading = false;
      this.totalPosts = postData.postCount;
    })
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe( isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  onChangedPage(pageData: PageEvent){
    this.isLoading = true;
    this.postPerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.postService.getPost(this.postPerPage, this.currentPage);
  }

  ngOnDestroy(): void {
    this.postSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }

  onDelete(id: any){
    this.isLoading = true;
    this.postService.deletePost(id).subscribe(() => {
      this.postService.getPost(this.postPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    });
  }
}
