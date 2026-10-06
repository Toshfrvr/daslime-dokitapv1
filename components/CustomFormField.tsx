/* eslint-disable no-unused-vars */
import { E164Number } from "libphonenumber-js/core";
import Image from "next/image";
import ReactDatePicker from "react-datepicker";
import { Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";

import { Checkbox } from "./ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

interface CustomProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  fieldType: FormFieldType;
}

const RenderInput = ({ field, props }: { field: any; props: CustomProps }) => {
  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative flex items-center rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:border-slate-600/50 focus-within:border-blue-500/50 transition-all duration-300">
            {props.iconSrc && (
              <div className="flex items-center justify-center w-12 h-12 text-slate-400">
                <Image
                  src={props.iconSrc}
                  height={20}
                  width={20}
                  alt={props.iconAlt || "icon"}
                  className="filter brightness-0 invert opacity-60"
                />
              </div>
            )}
            <FormControl>
              <Input
                placeholder={props.placeholder}
                {...field}
                className="flex-1 bg-transparent border-0 text-white placeholder:text-slate-400 focus:ring-0 focus:outline-none h-12 px-4 rounded-xl"
                disabled={props.disabled}
              />
            </FormControl>
          </div>
        </div>
      );

    case FormFieldType.TEXTAREA:
      return (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative">
            <FormControl>
              <Textarea
                placeholder={props.placeholder}
                {...field}
                disabled={props.disabled}
                className="min-h-[120px] w-full rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm px-4 py-3 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-0 focus:outline-none hover:border-slate-600/50 transition-all duration-300 resize-none"
              />
            </FormControl>
          </div>
        </div>
      );

    case FormFieldType.PHONE_INPUT:
      return (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative">
            <FormControl>
              <PhoneInput
                defaultCountry="KE"
                placeholder={props.placeholder || "+254 700 000 000"}
                international
                withCountryCallingCode
                value={field.value as E164Number | undefined}
                onChange={field.onChange}
                className="phone-input-modern"
                style={{
                  '--PhoneInput-color': '#ffffff',
                  '--PhoneInputInternationalIconPhone-opacity': '0.8',
                  '--PhoneInputInternationalIconGlobe-opacity': '0.65',
                  '--PhoneInputCountrySelect-marginRight': '0.5rem',
                  '--PhoneInputCountrySelectArrow-color': '#64748b',
                  '--PhoneInputCountrySelectArrow-opacity': '0.8',
                }}
              />
            </FormControl>
          </div>
        </div>
      );

    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
            <Checkbox
              id={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-1 border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
            />
            <label 
              htmlFor={props.name} 
              className="text-sm text-slate-300 leading-relaxed cursor-pointer select-none"
            >
              {props.label}
            </label>
          </div>
        </FormControl>
      );

      case FormFieldType.DATE_PICKER:
        return (
          // eslint-disable-next-line tailwindcss/no-custom-classname
          <div className="border-dark-500 bg-dark-400 flex items-center rounded-md border px-2 py-1">
            <Image
              src="/assets/icons/calendar.svg"
              height={24}
              width={24}
              alt="calendar"
              className="mr-2"
            />
            <FormControl>
              <ReactDatePicker
                showTimeSelect={props.showTimeSelect ?? false}
                selected={field.value}
                onChange={(date: Date) => field.onChange(date)}
                timeInputLabel="Time:"
                dateFormat={props.dateFormat ?? "MM/dd/yyyy"}
                wrapperClassName="date-picker"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100} // Number of years shown in dropdown
                scrollableYearDropdown
                className="bg-slate-900 text-white outline-none"
              />
            </FormControl>
          </div>
        );
      

    case FormFieldType.SELECT:
      return (
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-xl bg-linear-to-r from-blue-500/20 to-emerald-500/20 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>
          <div className="relative">
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50 focus:border-blue-500/50 focus:ring-0">
                    <SelectValue 
                      placeholder={props.placeholder}
                      className="text-white placeholder:text-slate-400"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border border-slate-700/50 bg-slate-800/95 text-white shadow-2xl backdrop-blur-xl">
                  {props.children}
                </SelectContent>
              </Select>
            </FormControl>
          </div>
        </div>
      );

    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;

    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, name, label } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1 space-y-3">
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className="mb-2 block text-sm font-medium text-slate-300">
              {label}
            </FormLabel>
          )}
          <RenderInput field={field} props={props} />
          <FormMessage className="mt-2 text-sm text-red-400" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;