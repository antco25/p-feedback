import './Dropdown.scss';
import { ReactComponent as IconArrowDown } from '../../../../assets/shared/icon-arrow-down.svg';
import { ReactComponent as IconArrowUp } from '../../../../assets/shared/icon-arrow-up.svg';
import { useEffect, useState } from 'react';
import useOutsideClick from '../../../../components/useOutsideClick';
import { feedbackCategory, FeedbackCategory, feedbackStatus, FeedbackStatus } from '../../../../data/database';

export type DropdownType = 'status' | 'category';

interface DropdownProps {
  value: string,
  options: string[]
  callback: (v: string) => void
  disabled?: boolean
}

interface DropdownStatusProps {
  value?: FeedbackStatus
  disabled?: boolean
  callback: (v: FeedbackStatus) => void
}

interface DropdownCategoryProps {
  value?: FeedbackCategory
  disabled?: boolean
  callback: (v: FeedbackCategory) => void
}

export function StatusDropdown(props: DropdownStatusProps) {
  const options = [...feedbackStatus]
  const value = props.value ? props.value : options[0]
  const cb = (v: string) => {
    props.callback(v as FeedbackStatus)
  }
  return <Dropdown value={value} options={options} callback={cb} disabled={props.disabled} />
}

export function CategoryDropdown(props: DropdownCategoryProps) {
  const options = [...feedbackCategory]
  const value = props.value ? props.value : options[0]
  const cb = (v: string) => {
    props.callback(v as FeedbackCategory)
  }
  return <Dropdown value={value} options={options} callback={cb} disabled={props.disabled} />
}

function Dropdown(props: DropdownProps) {
  const [dropdownActive, setDropdownActive] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState(props.value);
  const { ref, setIsComponentActive } = useOutsideClick(dropdownActive, onOutsideClick);

  useEffect(() => {
    setValue(props.value);
  }, [props.value])

  useEffect(() => {
    if (props.disabled != undefined)
      setDisabled(props.disabled);
  }, [props.disabled])

  const onValueChange = (newValue: string) => {
    if (newValue !== value) {
      setValue(newValue);
      props.callback(newValue);
    }
  }

  const handleSetDropdownActive = () => {
    if (disabled)
      return;

    setDropdownActive(!dropdownActive);
    setIsComponentActive(!dropdownActive);
  }

  function onOutsideClick() {
    setDropdownActive(false);
    setIsComponentActive(false);
  }

  return (
    <div ref={ref} className={`dropdown${dropdownActive ? ' dropdown-active' : ''}${disabled ? ' disabled' : ''}`} onClick={() => handleSetDropdownActive()}>
      <div className='value-wrap'>
        <div className='value'>{value.length < 3 ? value.toUpperCase() : value}</div>
        {dropdownActive ? <IconArrowUp className='arrow' /> : <IconArrowDown className='arrow' />}
      </div>

      <div className='dropdown-inner'>
        <ul>
          {
            props.options.map((option, index) => {
              return (
                <li key={index} className={option === value ? 'active' : ''} onClick={() => onValueChange(option)}>
                  {option.length < 3 ? option.toUpperCase() : option}
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  );
}

export default Dropdown;
