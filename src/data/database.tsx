import jsonData from './data';

/**
 * Types
 */

export const feedbackCategory = ['ui', 'ux', 'enhancement', 'bug', 'feature'] as const;
export type FeedbackCategory = typeof feedbackCategory[number];

export const feedbackStatus = ['suggestion', 'planned', 'in-progress', 'live'] as const;
export type FeedbackStatus = typeof feedbackStatus[number];

export const sortCategory = ['most-upvotes', 'least-upvotes', 'most-comments', 'least-comments'] as const;
export type SortCategory = typeof sortCategory[number];

export interface User {
    image: string,
    name: string,
    username: string,
}

export interface CurrentUser extends User {
    upvoted: number[]
}

export interface Reply {
    content: string,
    replyingTo: string,
    user: User
}

export interface Comment {
    id: number,
    content: string,
    user: User,
    replies: Reply[]
}

export interface ProductRequest {
    id: number,
    title: string,
    category: FeedbackCategory,
    upvotes: number,
    status: FeedbackStatus,
    description: string,
    comments: Comment[],
    commentsLength: number
}

export interface AppData {
    currentUser: CurrentUser;
    productRequests: ProductRequest[];
}

export interface FilterType {
    categories: FeedbackCategory[],
    sortBy: SortCategory
}

export interface RoadmapCountType {
    planned: number,
    inProgress: number,
    live: number,
}

export interface RoadmapType {
    planned: ProductRequest[],
    inProgress: ProductRequest[],
    live: ProductRequest[],
}

/**
 * Functions
 */

function processJsonData(jsonData: any): AppData {
    const currentUser: CurrentUser = {
        upvoted: [],
        image: jsonData.currentUser.image,
        name: jsonData.currentUser.name,
        username: jsonData.currentUser.username
    };

    const productRequests: ProductRequest[] = [];

    jsonData.productRequests.forEach((request: any) => {
        const comments: Comment[] = [];

        if (request.hasOwnProperty('comments')) {
            request.comments.forEach((comment: any) => {
                const replies: Reply[] = [];
                if (comment.hasOwnProperty('replies')) {
                    comment.replies.forEach((reply: any) => {
                        replies.push({
                            content: reply.content,
                            replyingTo: reply.replyingTo,
                            user: reply.user
                        })
                    })
                }

                comments.push({
                    id: comment.id,
                    content: comment.content,
                    user: comment.user,
                    replies: replies
                })
            })
        }

        productRequests.push({
            id: request.id,
            title: request.title,
            category: request.category,
            upvotes: request.upvotes,
            status: request.status,
            description: request.description,
            comments: comments,
            commentsLength: getCommentsLength(comments)
        })
    })

    return {
        currentUser: currentUser,
        productRequests: productRequests
    }
}

function getCommentsLength(comments: Comment[]) {
    let length = 0;
    comments.forEach((comment) => {
        length += comment.replies.length + 1;
    })
    return length;
}

/**
 * Database class
 */

function mockAPICall(time?: number) {
    const _time = time ? time : 400;

    return new Promise(resolve => {
        setTimeout(() => {
            resolve('')
        }, _time)
    })
}

export class Database {

    appData: AppData

    constructor() {
        this.appData = processJsonData(jsonData);
    }

    async getRoadmapCount() {
        await mockAPICall();

        const productRequests = this.appData.productRequests;

        const count = {
            planned: 0,
            inProgress: 0,
            live: 0,
        }

        productRequests.forEach((req) => {
            if (req.status === feedbackStatus[1]) count.planned++
            else if (req.status === feedbackStatus[2]) count.inProgress++
            else if (req.status === feedbackStatus[3]) count.live++
        })
        return count as RoadmapCountType;
    }

    async getRoadmap() {
        await mockAPICall();
        const productRequests = this.appData.productRequests;

        const planned: ProductRequest[] = [];
        const inProgress: ProductRequest[] = [];
        const live: ProductRequest[] = [];

        productRequests.forEach((req) => {
            if (req.status === 'planned') {
                planned.push(req)
            } else if (req.status === 'in-progress') {
                inProgress.push(req)
            } else if (req.status === 'live') {
                live.push(req)
            }
        })

        return {
            planned: planned,
            inProgress: inProgress,
            live: live
        } as RoadmapType
    }

    async getProductRequests(filter: FilterType) {
        await mockAPICall();
        const { categories, sortBy } = filter
        const productRequests = this.appData.productRequests;

        let filteredProductRequest = filterByCategory(categories);
        return sortProductRequests(filteredProductRequest, sortBy);

        function filterByCategory(categories: FeedbackCategory[]) {
            if (categories.length === 0) {
                return productRequests;
            } else {
                return productRequests.filter((req) => categories.includes(req.category))
            }
        }

        function sortProductRequests(productRequests: ProductRequest[], sortBy: SortCategory) {
            switch (sortBy) {
                case 'most-upvotes':
                    return [...productRequests].sort((a, b) => { return b.upvotes - a.upvotes })
                case 'least-upvotes':
                    return [...productRequests].sort((a, b) => { return a.upvotes - b.upvotes })
                case 'most-comments':
                    return [...productRequests].sort((a, b) => { return b.commentsLength - a.commentsLength })
                case 'least-comments':
                    return [...productRequests].sort((a, b) => { return a.commentsLength - b.commentsLength })
            }
        }
    }

    async getProductRequest(idParam: string) {
        await mockAPICall();
        const id = Number(idParam);

        if (isNaN(id) || !Number.isInteger(id)) {
            throw new TypeError();
        }

        const productRequest = this.appData.productRequests.find((r) => r.id === id);

        if (productRequest) {
            return productRequest
        } else {
            throw new RangeError();
        }
    }

    async getCurrentUser() {
        await mockAPICall();
        return this.appData.currentUser;
    }

    async postComment(productRequestId: number, content: string) {
        await mockAPICall();
        const productRequestIndex = this.appData.productRequests.findIndex((r) => r.id === productRequestId);
        if (productRequestIndex === -1) throw new RangeError();
        const productRequest = this.appData.productRequests[productRequestIndex];
        const currentUser = this.appData.currentUser;

        let newCommentId = 1;
        this.appData.productRequests.forEach(r => newCommentId += r.comments.length);

        const newComment = {
            id: newCommentId,
            content: content,
            user: {
                image: currentUser.image,
                name: currentUser.name,
                username: currentUser.username
            },
            replies: []
        }

        const updatedComments = [...productRequest.comments, newComment]
        const updatedProductRequest = { ...productRequest, comments: updatedComments, commentsLength: productRequest.commentsLength + 1 }
        this.appData.productRequests[productRequestIndex] = updatedProductRequest;

        return updatedProductRequest;
    }

    async postReply(productRequestId: number, commentId: number, content: string, replyingTo: string) {
        await mockAPICall();
        const productRequestIndex = this.appData.productRequests.findIndex((r) => r.id === productRequestId);
        if (productRequestIndex === -1) throw new RangeError();
        const productRequest = this.appData.productRequests[productRequestIndex];
        const currentUser = this.appData.currentUser;

        const newReply = {
            content: content,
            replyingTo: replyingTo,
            user: {
                image: currentUser.image,
                name: currentUser.name,
                username: currentUser.username
            }
        }

        const commentIndex = productRequest.comments.map((c) => { return c.id }).indexOf(commentId);

        const updatedReplies = [...productRequest.comments[commentIndex].replies, newReply];
        const updatedComment = { ...productRequest.comments[commentIndex], replies: updatedReplies };
        const updatedComments = productRequest.comments.map((c) => {
            if (c.id === commentId) return updatedComment;
            else return c;
        });
        const updatedProductRequest = { ...productRequest, comments: updatedComments, commentsLength: productRequest.commentsLength + 1 };
        this.appData.productRequests[productRequestIndex] = updatedProductRequest;
        return updatedProductRequest;
    }

    async setUpvote(productRequestId: number) {
        await mockAPICall(100);
        const productRequestIndex = this.appData.productRequests.findIndex((r) => r.id === productRequestId);
        if (productRequestIndex === -1) throw new RangeError();

        const updatedUpvoted: number[] = [];
        const updatedProductRequests: ProductRequest[] = [];
        const updatedProductRequest = Object.assign({}, this.appData.productRequests[productRequestIndex]);

        let addTo = true;
        this.appData.currentUser.upvoted.forEach((upvotedId) => {
            if (upvotedId === productRequestId) {
                addTo = false;
            } else {
                updatedUpvoted.push(upvotedId)
            }
        })

        if (addTo) {
            updatedUpvoted.push(productRequestId);
            updatedProductRequest.upvotes++;
        } else {
            updatedProductRequest.upvotes--;
        }

        this.appData.productRequests.forEach((req, index) => {
            if (productRequestId - 1 === index) {
                updatedProductRequests.push(updatedProductRequest);
            } else {
                updatedProductRequests.push(req)
            }
        })

        const updatedCurrentUser = {
            upvoted: updatedUpvoted,
            image: this.appData.currentUser.image,
            name: this.appData.currentUser.name,
            username: this.appData.currentUser.username
        }

        this.appData.currentUser = updatedCurrentUser
        this.appData.productRequests = updatedProductRequests;

        return { currentUser: updatedCurrentUser, productRequest: updatedProductRequest };
    }

    async postProductRequest(title: string, category: FeedbackCategory, description: string) {
        await mockAPICall();

        const newId = this.appData.productRequests[this.appData.productRequests.length - 1].id + 1;
        const productRequest = {
            id: newId,
            title: title,
            category: category,
            upvotes: 1,
            status: 'feature' as FeedbackStatus,
            description: description,
            comments: [] as Comment[],
            commentsLength: 0
        }

        const updatedUpvoted = [...this.appData.currentUser.upvoted, newId]
        const updatedCurrentUser = { ...this.appData.currentUser, upvoted: updatedUpvoted }

        this.appData.currentUser = updatedCurrentUser;
        this.appData.productRequests.push(productRequest);
        return { productRequest: productRequest, currentUser: updatedCurrentUser };
    }

    async postProductRequestEdit(productRequest: ProductRequest) {
        await mockAPICall();
        const productRequestIndex = this.appData.productRequests.findIndex((r) => r.id === productRequest.id);
        if (productRequestIndex === -1) throw new RangeError();
        this.appData.productRequests[productRequestIndex] = productRequest;
    }

    async deleteProductRequest(productRequestId: number) {
        await mockAPICall();
        const updatedUpvoted = this.appData.currentUser.upvoted.filter((u) => u !== productRequestId);
        const updatedProductRequests = this.appData.productRequests.filter((r) => r.id !== productRequestId);
        const updatedCurrentUser = { ...this.appData.currentUser, upvoted: updatedUpvoted }

        this.appData.currentUser = updatedCurrentUser;
        this.appData.productRequests = updatedProductRequests;

        return updatedCurrentUser;
    }
}






