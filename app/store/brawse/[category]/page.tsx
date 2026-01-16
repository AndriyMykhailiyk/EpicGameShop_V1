import React from "react";

type Props = {
  params: {
    category: string;
  };
};

export default function CategoryPage({ params }: Props) {
  return (
    <main style={{ padding: "20px" }}>
      <h1>Category: {params.category}</h1>
      <p>Games filtered by category.</p>
    </main>
  );
}
