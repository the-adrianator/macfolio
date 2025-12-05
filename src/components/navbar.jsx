import dayjs from "dayjs";

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
						<li key={id}>
							<img src={img} alt={`icon-${id}`} className="icon-hover" />
						</li>
					))}
				</ul>
			<time>{dayjs().format("ddd MMM D h:mm A")}</time>
			</div>

    </nav>
  );
};

export default Navbar;
