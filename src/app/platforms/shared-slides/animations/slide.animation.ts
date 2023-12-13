import {
  transition,
  style,
  animate,
  trigger,
  useAnimation,
  animation
} from '@angular/animations';

export const SlideEnterAnimation = animation([
  style({ transform: 'translate({{ x }}, {{ y }})' }),
  animate(
    '{{ duration }} cubic-bezier(0.59, 0.32, 0.38, 1.13)',
    style({ transform: 'translate(0)' })
  )
]);

export const SlideExitAnimation = animation([
  style({ transform: 'translate(0)' }),
  animate(
    '{{ duration }} cubic-bezier(0.59, 0.32, 0.38, 1.13)',
    style({ transform: 'translate({{ x }}, {{ y }})' })
  )
]);

export const SlideRight = trigger('slideRight', [
  transition(
    ':enter',
    useAnimation(SlideEnterAnimation, {
      params: { x: `${window.innerWidth}px`, y: 0, duration: '0.5s' }
    })
  ),
  transition(
    ':leave',
    useAnimation(SlideExitAnimation, {
      params: { x: `${window.innerWidth}px`, y: 0, duration: '0.5s' }
    })
  )
]);
