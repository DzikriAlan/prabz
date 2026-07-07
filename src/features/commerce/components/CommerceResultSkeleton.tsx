import CommerceProductCardSkeleton from './CommerceProductCardSkeleton'

const SKELETON_COUNT = 10

export default function CommerceResultSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <CommerceProductCardSkeleton key={index} />
      ))}
    </div>
  )
}
