import { MergeExclusive } from 'type-fest'

export type MergeExclusive3<T, K, U>  = MergeExclusive<MergeExclusive<T, K>, U>

// type Without<FirstType, SecondType> = {[KeyType in Exclude<keyof FirstType, keyof SecondType>]?: never};

// export type MergeExclusive3<T, K, U> =
// 	(T | K | U) extends object ?
// 		(Without<T, K> & K) | (Without<T, K> & T) | (Without<T, U> & T) | (Without<T, U> & U) | (Without<K, U> & K) | (Without<K, U> & U) :
// 		T | K | U;

export type MergeExclusive4<T, K, U, P>  = MergeExclusive<MergeExclusive3<T, K, U>, P>
