import {
    trigger,
    animate,
    transition,
    query,
    style,
    group,
    animateChild,
    state
} from '@angular/animations';

export const HomeAnimation = trigger('pathSelect', [
    state('home', style({
        margin: 'auto',
        height: '650px',
        width: '50vw',
        backgroundColor: 'rgb(255, 255, 255)',
        display: 'grid',
        alignItems: 'center',
        borderRadius: '40px',
        boxShadow: '0 10px 15px 0 rgba(0, 0, 0, .2)',
    })),
    state('auction', style({
        margin: 'auto',
        height: '600px',
        width: '60vw',
        backgroundColor: 'rgb(255, 255, 255)',
        display: 'grid',
        alignItems: 'center',
        borderRadius: '40px',
        boxShadow: '0 10px 15px 0 rgba(0, 0, 0, .2)',
    }
    )),
    state('changeColor', style({
        margin: 'auto',
        height: '700px',
        width: '60vw',
        backgroundColor: 'rgb(255, 255, 255)',
        display: 'grid',
        alignItems: 'center',
        borderRadius: '40px',
        boxShadow: '0 10px 15px 0 rgba(0, 0, 0, .2)',

    })),
    transition('home <=> auction', [
        animate('0.5s')
    ]),
    transition('home <=> changeColor', [
        animate('0.5s')
    ]),
    transition('auction <=> changeColor', [
        animate('0.5s')
    ])


]);
