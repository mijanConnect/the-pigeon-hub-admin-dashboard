import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";

const FeaturedInput = ({ value = [], onChange }) => {
  return (
    <Form.List name="features" initialValue={value}>
      {(fields, { add, remove }) => (
        <>
          {fields.map((field, index) => (
            <div key={field.key} className="flex items-start gap-2 w-full ">
              <Form.Item
                {...field}
                className="w-full"
                validateTrigger={["onChange", "onBlur"]}
                rules={[{ required: true, message: "Feature is required" }]}
              >
                <Input
                  placeholder="Feature Name"
                  className="w-full custom-input-ant-modal"
                  value={value[index] || ""}
                  onChange={(e) => {
                    const newValues = [...value];
                    newValues[index] = e.target.value;
                    onChange(newValues);
                  }}
                />
              </Form.Item>

              {fields.length > 2 && (
                <MinusCircleOutlined
                  className="text-red-500 text-lg cursor-pointer mt-3"
                  onClick={() => {
                    // remove from form list first, then update external value
                    remove(field.name);
                    const newValues = value.filter((_, i) => i !== index);
                    onChange(newValues);
                  }}
                />
              )}
            </div>
          ))}

          <Form.Item className="w-full flex justify-start">
            <Button
              type="dashed"
              onClick={() => {
                // add to form list, then update external value once
                add();
                onChange([...value, ""]);
              }}
              icon={<PlusOutlined />}
              className="w-full mb-[2px]"
            >
              Add Feature
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default FeaturedInput;
