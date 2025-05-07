import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

export default function Switch({ options, value, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(options);
  }, [options]);

  return (
    <div className="w-auto my-3">
      <Combobox
        value={options.find((o) => o.value === value)}
        onChange={(value) => onChange(value)}
        className={"w-full"}
        as="div"
      >
        <div className="relative">
          <ComboboxInput
            className="w-full block rounded-lg border-none bg-white/5 py-1.5 pr-8 pl-3 text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
            displayValue={(person) => person?.label}
            onChange={(e) =>
              setSelected(
                options.filter((user) =>
                  user.label.toLowerCase().includes(e.target.value)
                )
              )
            }
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom"
          transition
          className="w-[var(--input-width)] rounded-xl border border-white/5 z-40 bg-black p-1 [--anchor-gap:var(--spacing-1)] empty:invisible transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
        >
          {selected.map((person, i) => (
            <ComboboxOption
              key={i}
              value={person}
              className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            >
              <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
              <div className="text-sm/6 text-white">{person.label}</div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
