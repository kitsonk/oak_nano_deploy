import { h, Helmet } from "./deps.ts";
import { Comments } from "./Comments.tsx";

interface AppProps {
  comments: unknown[];
}

export const App = (props: AppProps) => (<div>
  <Helmet>
    <title>Oak Deno Deploy Example</title>
    <meta
      name="description"
      content="Server Side Rendering oka/Nano/Deploy"
    />
  </Helmet>

  <Helmet footer>
    <script src="/bundle.js"></script>
  </Helmet>

  <h2>Comments</h2>
  <div id="comments">
    <Comments comments={props.comments} />
  </div>
</div>);
