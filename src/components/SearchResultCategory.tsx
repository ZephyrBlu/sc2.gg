import { LoadingAnimation } from './LoadingAnimation';
import './SearchResultCategory.css';

interface Props {
  title: string;
  data: any[];
  loading: boolean;
  max?: number;
  inline?: boolean;
  children: JSX.Element[];
}

export function SearchResultCategory({
  title,
  data,
  loading,
  max,
  inline = false,
  children,
}: Props) {
  return (
    <div className="SearchResultCategory">
      <h3 className="SearchResultCategory__title">
        {title}
      </h3>
      {loading && <LoadingAnimation />}
      {!loading && data.length === 0 &&
        <span className="SearchResultsCategory__empty">
          No results
        </span>}
      {!loading && data.length > 0 &&
        <div className={`
          SearchResultCategory__content
          ${inline ? 'SearchResultCategory__content--inline' : ''}
        `}>
          {max ? children.slice(0, max) : children}
        </div>}
    </div>
  )
}
