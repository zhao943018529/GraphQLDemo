import * as React from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

const ARTICLE_LIST = gql`
  {
    getArticles {
      id
      name
      content
      author
    }
  }
`;

interface Article {
  id: string;
  name: string;
  content: string;
  author: string;
}

interface QueryArticles {
  getArticles: Article[];
}

function isNumber(x: any): x is number {
  return typeof x === 'number';
}

const aoc = 4 as any;
if (isNumber(aoc)) {
  console.log(aoc + 5);
}

export default function Articles(): JSX.Element {
  const { loading, data } = useQuery<QueryArticles>(ARTICLE_LIST);
  if (loading) return <div>Loading...</div>;

  const tt = data.getArticles.length;
  switch (tt) {
    case 1:
      console.log(1);
      break;
  }
  return (
    <ul>
      {data.getArticles.map(article => {
        return (
          <li key={article.id}>
            <p>{article.name}</p>
            <p>{article.content}</p>
          </li>
        );
      })}
    </ul>
  );
}
