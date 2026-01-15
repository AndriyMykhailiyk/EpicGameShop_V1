interface PageProps {
  params: {
    category: string;
  };
}

export default function CategoryPage({ params }: PageProps) {
  const { category } = params;

  return (
    <div>
      <h1>Category: {category}</h1>
    </div>
  );
}
