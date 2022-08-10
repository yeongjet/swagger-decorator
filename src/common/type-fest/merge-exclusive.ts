import { MergeExclusive } from 'type-fest'

export type MergeExclusive3<T, K, U>  = MergeExclusive<MergeExclusive<T, K>, U>

export type MergeExclusive4<T, K, U, P>  = MergeExclusive<MergeExclusive3<T, K, U>, P>
