import { Component, h, Helmet } from "./deps.ts";
import { Comments } from "./Comments.tsx";

interface AppProps {
  comments: unknown[];
}

export class App extends Component<AppProps> {
  render() {
    return (<div>
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
        <Comments comments={this.props.comments} />
      </div>
    </div>);
  }
}
