import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Database, FeedbackCategory, ProductRequest, SortCategory, CurrentUser, FilterType, RoadmapCountType, RoadmapType } from '../../data/database';
import { RootState } from '../store'

const database = new Database;

export const fetchCurrentUser = createAsyncThunk(
    'data/fetchCurrentUser',
    async () => {
        return database.getCurrentUser();
    }
)

export const fetchRoadmapCount = createAsyncThunk(
    'data/fetchRoadmapCount',
    async () => {
        return database.getRoadmapCount();
    }
)

export const fetchRoadmap = createAsyncThunk(
    'data/fetchRoadmap',
    async () => {
        return database.getRoadmap();
    }
)

export const fetchProductRequests = createAsyncThunk(
    'data/fetchDataStatus',
    async (filter: FilterType) => {
        return database.getProductRequests(filter);
    }
)

export const fetchProductRequest = createAsyncThunk(
    'data/fetchProductRequest',
    async (productRequestId: string) => {
        return database.getProductRequest(productRequestId);
    }
)

export const dataSlice = createSlice({
    name: 'data',
    initialState: {
        currentUser: {} as CurrentUser,
        currentUserStatus: 'loading',
        roadmapCount: { planned: 0, inProgress: 0, live: 0, } as RoadmapCountType,
        roadmapCountStatus: 'loading',
        roadmap: {} as RoadmapType,
        roadmapStatus: 'loading',
        productRequests: [] as ProductRequest[],
        productRequestsStatus: 'loading',
        productRequest: {} as ProductRequest,
        productRequestStatus: 'loading',
        sortBy: 'most-upvotes' as SortCategory,
        categoryFilters: [] as FeedbackCategory[],
        history: ['/']
    },
    reducers: {
        setCategoryFilters: (state, action: CategoryFilterAction) => {
            const categoryFilters = action.payload;
            return { ...state, categoryFilters: categoryFilters }
        },
        setSorting: (state, action: SortByAction) => {
            const sortBy = action.payload;
            return { ...state, sortBy: sortBy }
        },
        setCurrentUser: (state, action: CurrentUserAction) => {
            return { ...state, currentUser: action.payload }
        },
        setProductRequest: (state, action: ProductRequestAction) => {
            return { ...state, productRequest: action.payload }
        },
        setProductRequests: (state, action: ProductRequestsAction) => {
            return { ...state, productRequests: action.payload }
        },
        setRoadmap: (state, action: RoadmapAction) => {
            return { ...state, roadmap: action.payload }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProductRequests.fulfilled, (state, action) => {
            return {
                ...state, productRequests: action.payload, productRequestsStatus: 'ready'
            }
        })
            .addCase(fetchProductRequests.pending, (state) => {
                return { ...state, productRequestsStatus: 'loading' }
            })
            .addCase(fetchProductRequests.rejected, (state) => {
                return { ...state, productRequestsStatus: 'error' }
            })

        builder.addCase(fetchProductRequest.fulfilled, (state, action) => {
            return { ...state, productRequest: action.payload, productRequestStatus: 'ready' }
        })
            .addCase(fetchProductRequest.pending, (state) => {
                return { ...state, productRequestStatus: 'loading' }
            })
            .addCase(fetchProductRequest.rejected, (state) => {
                return { ...state, productRequestStatus: 'error' }
            })

        builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
            return { ...state, currentUser: action.payload, currentUserStatus: 'ready' }
        })
            .addCase(fetchCurrentUser.pending, (state) => {
                return { ...state, currentUserStatus: 'loading' }
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                return { ...state, currentUserStatus: 'error' }
            })

        builder.addCase(fetchRoadmapCount.fulfilled, (state, action) => {
            return { ...state, roadmapCount: action.payload, roadmapCountStatus: 'ready' }
        })
            .addCase(fetchRoadmapCount.pending, (state) => {
                return { ...state, roadmapCountStatus: 'loading' }
            })
            .addCase(fetchRoadmapCount.rejected, (state) => {
                return { ...state, roadmapCountStatus: 'error' }
            })

        builder.addCase(fetchRoadmap.fulfilled, (state, action) => {
            return { ...state, roadmap: action.payload, roadmapStatus: 'ready' }
        })
            .addCase(fetchRoadmap.pending, (state) => {
                return { ...state, roadmapStatus: 'loading' }
            })
            .addCase(fetchRoadmap.rejected, (state) => {
                return { ...state, roadmapStatus: 'error' }
            })
    }
})

/**
 * Action Types
 */

interface CategoryFilterAction {
    type: string,
    payload: FeedbackCategory[]
}

interface SortByAction {
    type: string,
    payload: SortCategory
}

interface CurrentUserAction {
    type: string,
    payload: CurrentUser
}

interface ProductRequestAction {
    type: string,
    payload: ProductRequest
}

interface ProductRequestsAction {
    type: string,
    payload: ProductRequest[]
}

interface RoadmapAction {
    type: string,
    payload: RoadmapType
}

/**
 * Methods
 */
export const postProductRequest = async (title: string, category: FeedbackCategory, description: string) => {
    return await database.postProductRequest(title, category, description);
}

export const postProductRequestEdit = async (productRequest: ProductRequest) => {
    return await database.postProductRequestEdit(productRequest);
}

export const deleteProductRequest = async (productRequestId: number) => {
    return await database.deleteProductRequest(productRequestId);
}

export const postComment = async (productRequestId: number, content: string) => {
    return await database.postComment(productRequestId, content);
}

export const postReply = async (productRequestId: number, commentId: number, content: string, replyingTo: string) => {
    return await database.postReply(productRequestId, commentId, content, replyingTo);
}

export const setUpvote = async (productRequestId: number) => {
    return await database.setUpvote(productRequestId);
}

/**
 * Helper methods
 */

export const { setCategoryFilters, setSorting, setCurrentUser, setProductRequest, setProductRequests, setRoadmap} = dataSlice.actions;

export const selectProductRequests = (state: RootState) => {
    return {
        currentUser: state.data.currentUser,
        productRequests: state.data.productRequests,
        productRequestStatus: state.data.productRequestsStatus,
        sortBy: state.data.sortBy,
        categoryFilters: state.data.categoryFilters
    }
};

export const selectProductRequest = (state: RootState) => {
    return {
        productRequest: state.data.productRequest,
        productRequestStatus: state.data.productRequestStatus
    }
};

export const selectRoadmapCount = (state: RootState) => {
    return {
        roadmapCount: state.data.roadmapCount,
        roadmapCountStatus: state.data.roadmapCountStatus
    }
};

export const selectRoadmap = (state: RootState) => {
    return {
        roadmap: state.data.roadmap,
        roadmapStatus: state.data.roadmapStatus
    }
};

export const selectCurrentUser = (state: RootState) => {
    return {
        currentUser: state.data.currentUser,
        currentUserStatus: state.data.currentUserStatus
    }
};

export const selectHistory = (state: RootState) => {
    return state.data.history
};

export default dataSlice.reducer