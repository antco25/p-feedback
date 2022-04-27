import './SuggestSort.scss';
import { ReactComponent as IconArrowDown } from '../../../../../assets/shared/icon-arrow-down.svg';
import { ReactComponent as IconArrowUp } from '../../../../../assets/shared/icon-arrow-up.svg';
import { useEffect, useState } from 'react';
import { SortCategory, sortCategory } from '../../../../../data/database';
import { useDispatch } from 'react-redux';
import { setSorting } from '../../../../../redux/data/dataSlice';
import useOutsideClick from '../../../../../components/useOutsideClick';

interface SuggestSortProps {
  sort: SortCategory
}

function SuggestSort(props: SuggestSortProps) {
  const [dropdownActive, setDropdownActive] = useState(false);
  const { ref, setIsComponentActive } = useOutsideClick(dropdownActive, onOutsideClick);
  const [sort, setSort] = useState<SortCategory>(props.sort);

  useEffect(() => {
    setSort(props.sort)
  }, [props.sort])
  const dispatch = useDispatch();
  const handleSetSort = (newSort: SortCategory) => {
    if (newSort !== sort) {
      dispatch(setSorting(newSort));
    }
  }

  const handleSetDropdownActive = () => {
    setDropdownActive(!dropdownActive);
    setIsComponentActive(!dropdownActive);
  }

  function onOutsideClick() {
    setDropdownActive(false);
    setIsComponentActive(false);
  }

  return (
    <div ref={ref} className={`suggest-sort${dropdownActive ? ' dropdown-active' : ''}`} onClick={() => handleSetDropdownActive()}>
      <span className="sort-text" />
      <span className='bold sort'>{sort.replace(/-/, " ")}</span>
      {dropdownActive ? <IconArrowUp className='arrow' /> : <IconArrowDown className='arrow' />}
      <div className='dropdown'>
        <ul>
          {
            sortCategory.map((_sort, index) => {
              return <li key={index} className={`${sort === _sort ? 'active ' : ''}sort`} onClick={() => handleSetSort(_sort)}>{_sort.replace(/-/, " ")}</li>
            })
          }
        </ul>
      </div>
    </div>
  );
}

export default SuggestSort;
