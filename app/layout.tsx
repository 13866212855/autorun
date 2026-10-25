import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'AI驱动的浏览器表单自动填写助手 | AI Form AutoFiller',
  description: '结合Chrome扩展与多模态大模型的表单智能填充系统，支持Excel台账解析、页面截图与表单结构多模态映射、受控组件原生注入与批量翻页填写',
  openGraph: {
    title: 'AI驱动的浏览器表单自动填写助手',
    description: '结合Chrome扩展与多模态大模型的表单智能填充系统，支持Excel台账解析、页面截图与表单结构多模态映射',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI驱动的浏览器表单自动填写助手',
    description: '结合Chrome扩展与多模态大模型的表单智能填充系统',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
