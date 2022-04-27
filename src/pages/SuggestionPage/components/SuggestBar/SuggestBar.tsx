import './SuggestBar.scss';
import IconSuggestions from '../../../../assets/suggestions/icon-suggestions.svg'
import SuggestSort from './SuggestSort/SuggestSort';
import { Link } from 'react-router-dom';
import { SortCategory } from '../../../../data/database';
import { rootURL } from '../../../../components/App/App';

interface SuggestBarProps {
  suggestionsCount: number,
  sort : SortCategory,
  loading: boolean
}

function SuggestBar(props: SuggestBarProps) {
  const { sort, suggestionsCount, loading } = props;
  return (
    <div className='suggest-bar'>
      <div className={`suggest-count${loading ? ' loading' : ''}`}>
        <img src={IconSuggestions} />
        <span>{`${suggestionsCount} ${suggestionsCount === 1 ? 'Suggestion' : 'Suggestions'}`}</span>
      </div>
      <SuggestSort sort={sort} />
      <Link to={`${rootURL}/new`} className='suggest-add link-button bt-1' state={{ from: [rootURL + '/'] }}>+ Add Feedback</Link>
    </div>
  );
}

export default SuggestBar;
