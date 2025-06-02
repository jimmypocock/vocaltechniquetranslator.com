import { articlesMetadata } from './metadata'

export const metadata = articlesMetadata

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}