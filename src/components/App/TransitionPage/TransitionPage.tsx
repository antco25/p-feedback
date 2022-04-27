import './TransitionPage.scss';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useLocation } from 'react-router-dom';

interface TransitionPageProps {
  children: React.ReactNode
}

function TransitionPage(props : TransitionPageProps) {
  const key = useLocation().key;
  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={key}
        classNames="fade"
        timeout={300}
        exit={false}
        appear={true}
      >
        {props.children}
      </CSSTransition>
    </TransitionGroup>
  )
}

export default TransitionPage;
