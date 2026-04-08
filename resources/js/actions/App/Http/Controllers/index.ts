import WeatherController from './WeatherController'
import MarkerController from './MarkerController'
import StoreController from './StoreController'
import BooksController from './BooksController'
import StripeCheckoutController from './StripeCheckoutController'
import PostController from './PostController'
import CommentController from './CommentController'
import Settings from './Settings'

const Controllers = {
    WeatherController: Object.assign(WeatherController, WeatherController),
    MarkerController: Object.assign(MarkerController, MarkerController),
    StoreController: Object.assign(StoreController, StoreController),
    BooksController: Object.assign(BooksController, BooksController),
    StripeCheckoutController: Object.assign(StripeCheckoutController, StripeCheckoutController),
    PostController: Object.assign(PostController, PostController),
    CommentController: Object.assign(CommentController, CommentController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers