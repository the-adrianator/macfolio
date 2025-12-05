import Time from "@components/ui/time";
import Icon from "@components/ui/icon";
import { navIcons, navLinks } from "@constants";


const Navbar = () => {
  return (
    <nav>
      <div>
        <img src="/images/logo.svg" alt="logo" />
        <p className="font-bold">Adrian's Portfolio</p>
        <ul>
          {navLinks.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      </div>

			<div>
				<ul>
					{navIcons.map(({ id, img }) => (
						<li key={id} className="icon-item">
							<Icon src={img} alt={`icon-${id}`} />
						</li>
					))}
				</ul>
				<Time />
			</div>

    </nav>
  );
};

export default Navbar;
