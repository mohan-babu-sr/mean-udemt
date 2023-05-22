import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthData } from "./auth-data.model";
import { Subject } from "rxjs";
import { environment } from "src/environments/environments";

const BACKEND_URL = environment.apiURL + '/user/';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private token: string;
    private isAuthenticated = false;
    private authStatusListener = new Subject<boolean>();
    private tokenTimer: any;
    private userId: string;

    constructor(private http: HttpClient, private router: Router) { }

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        return this.http.post(BACKEND_URL + 'signup', authData).subscribe(response => {
            console.log(response);
            this.router.navigate(['/']);
        }, error => {
            this.authStatusListener.next(false);
            console.log("error while creating user");
        })
    }

    login(email: string, password: string) {
        const authData: AuthData = { email: email, password: password };
        this.http.post<{ token: string, expiresIn: number, userId: string }>(BACKEND_URL + 'login', authData).subscribe(response => {
            console.log(response);
            this.token = response.token;
            if (this.token) {
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.authStatusListener.next(true);
                const date = new Date();
                const expirationDate = new Date(date.getTime() + expiresInDuration * 1000);
                this.saveAuthData(this.token, expirationDate, this.userId);
                this.router.navigate(['/']);
            }
        }, error => {
            this.authStatusListener.next(false);
            console.log("error while login user");
        })
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        if (!authInformation) {
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if (expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
        }
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
    }

    private setAuthTimer(duration) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem('userId', userId);
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString())
    }

    private clearAuthData() {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
    }

    private getAuthData() {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        if (!token || !expirationDate) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        }
    }
}