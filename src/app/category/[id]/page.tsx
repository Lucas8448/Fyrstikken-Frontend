export default function Page({ params }: { params: { id: number } }) {
    return <div>Kategori id: {params.id}</div>
}