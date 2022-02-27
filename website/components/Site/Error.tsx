export default function Error({ error }: { error: Error }) {
  return <div className="p-4">An error occurred: {error.message}</div>
}
