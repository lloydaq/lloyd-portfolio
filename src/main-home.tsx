import { initTitleMorph } from './components/titleMorph';
import { mount } from './mount';
import { Home } from './pages/Home';
import './styles/global.css';
import './styles/pipeline.css';
import './styles/home.css';

initTitleMorph();
mount(<Home />);
