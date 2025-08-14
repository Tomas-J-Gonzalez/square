import withAuth from '../src/components/withAuth';
import Home from '../src/pages/Home';

function IndexPage() {
  return <Home />;
}

export default withAuth(IndexPage);

