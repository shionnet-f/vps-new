'use client';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';
import { rally, toggleTimeout, bumpCell, undo, redo, initialState } from '@/app/features/match/matchSlice';

export default function Page() {
    const dispatch = useAppDispatch();
    const present = useAppSelector(s => s.match.present);

    return (
        <main className='text-black' style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className='border' onClick={() => dispatch(rally({ winner: 'us' }))}>自チーム得点</button>
                <button className='border' onClick={() => dispatch(rally({ winner: 'them' }))}>相手得点</button>
                <button className='border' onClick={() => dispatch(toggleTimeout({ team: 'us' }))}>TO(us)</button>
                <button className='border' onClick={() => dispatch(bumpCell({ pid: 'p1', path: ['spike', 'count'] }))}>p1 spike.count +1</button>
                <button className='border' onClick={() => dispatch(undo())}>Undo</button>
                <button className='border' onClick={() => dispatch(redo())}>Redo</button>
            </div>
        </main>
    );
}
