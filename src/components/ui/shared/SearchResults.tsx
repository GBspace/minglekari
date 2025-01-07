import { Models } from "appwrite";
import Loader from "./loader";
import GridPostList from "./GridPostList";

type SearchResultsProp = {
  isSearchFetching: boolean;
  searchedPost?: Models.DocumentList<Models.Document>;
};

const SearchResults = ({
  isSearchFetching,
  searchedPost,
}: SearchResultsProp) => {
  if (isSearchFetching) return <Loader />;
  if (searchedPost && searchedPost?.documents.length > 0) {
    return <GridPostList posts={searchedPost.documents} />;
  }
  return (
    <p className="text-light-4 mt-10 text-center w-full"> No results found</p>
  );
};

export default SearchResults;
