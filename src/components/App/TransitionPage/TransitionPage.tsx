import './TransitionPage.scss';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';

interface TransitionPageProps {
  children: React.ReactNode
}

function TransitionPage(props: TransitionPageProps) {
  const transitionRef = useRef<any>(null);
  const key = useLocation().key;
  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={key}
        classNames="fade"
        timeout={300}
        exit={false}
        appear={true}
        nodeRef={transitionRef}
        addEndListener={(done: () => void) => transitionRef.current?.addEventListener("transitionend", done, false)}
      >
        <div className='transition' ref={transitionRef}>
          {props.children}
        </div>
      </CSSTransition>
    </TransitionGroup>
  )
}

export default TransitionPage;
